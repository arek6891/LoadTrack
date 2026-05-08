import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface Pallet {
  id: string;
  palletNumber: string;
  _count: { packages: number };
}

interface Loading {
  id: string;
  driverName: string;
  vehicleRegistration: string;
  closedAt: string;
  _count: { pallets: number };
  pallets: Pallet[];
}

export default function LoadingHistory() {
  const [history, setHistory] = useState<Loading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoading, setSelectedLoading] = useState<Loading | null>(null);

  // Filtry
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverName, setDriverName] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (driverName) params.append('driverName', driverName);

      const response = await axios.get(`/api/loadings/history?${params.toString()}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, driverName]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Statystyki
  const stats = useMemo(() => {
    const totalLoadings = history.length;
    const totalPallets = history.reduce((acc, curr) => acc + curr._count.pallets, 0);
    const totalPackages = history.reduce((acc, curr) => 
      acc + curr.pallets.reduce((pAcc, pCurr) => pAcc + pCurr._count.packages, 0), 0
    );
    const avgPallets = totalLoadings > 0 ? (totalPallets / totalLoadings).toFixed(1) : 0;

    return { totalLoadings, totalPallets, totalPackages, avgPallets };
  }, [history]);

  const handleExportExcel = () => {
    const wsData = history.map(item => ({
      'Data zamknięcia': item.closedAt ? new Date(item.closedAt).toLocaleString() : 'N/A',
      'Kierowca': item.driverName,
      'Numer rejestracyjny': item.vehicleRegistration,
      'Liczba palet': item._count.pallets,
      'Łącznie paczek': item.pallets.reduce((acc, curr) => acc + curr._count.packages, 0),
      'ID Transportu': item.id
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historia Załadunków");

    const fileName = `LoadTrack_Historia_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">HISTORIA WYDAŃ</h1>
          <p className="text-gray-500 text-sm mt-1">Archiwum zamkniętych transportów i załadunków.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          disabled={history.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <span>Eksportuj Raport</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Transporty" value={stats.totalLoadings} icon="🚚" color="blue" />
        <KPICard title="Wysłane Palety" value={stats.totalPallets} icon="📦" color="green" />
        <KPICard title="Wysłane Paczki" value={stats.totalPackages} icon="📦" color="purple" />
        <KPICard title="Śr. Palet/Zał." value={stats.avgPallets} icon="📈" color="orange" />
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data od</label>
          <input 
            type="date"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data do</label>
          <input 
            type="date"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kierowca / Pojazd</label>
          <input 
            type="text"
            placeholder="Szukaj po nazwisku..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Data Zamknięcia</th>
                <th className="px-6 py-4">Kierowca</th>
                <th className="px-6 py-4">Pojazd</th>
                <th className="px-6 py-4 text-center">Palety</th>
                <th className="px-6 py-4">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Pobieranie historii...</span>
                    </div>
                  </td>
                </tr>
              ) : history.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {item.closedAt ? new Date(item.closedAt).toLocaleString('pl-PL') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800">{item.driverName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 bg-slate-50 rounded inline-block mt-4 mx-6">{item.vehicleRegistration}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black text-xs">
                      {item._count.pallets}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedLoading(item)}
                      className="bg-slate-900 text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                    >
                      Szczegóły
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">Brak danych historycznych dla wybranych kryteriów.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal szczegółów */}
      {selectedLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight">SZCZEGÓŁY TRANSPORTU</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">ID: {selectedLoading.id.split('-')[0]}...</p>
              </div>
              <button 
                onClick={() => setSelectedLoading(null)} 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <DetailItem label="Kierowca" value={selectedLoading.driverName} />
                <DetailItem label="Pojazd" value={selectedLoading.vehicleRegistration} />
                <DetailItem label="Data Zamknięcia" value={new Date(selectedLoading.closedAt).toLocaleString('pl-PL')} />
                <DetailItem label="Łącznie Palet" value={selectedLoading._count.pallets} />
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Lista Załadowanych Palet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLoading.pallets.map(p => (
                    <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all">
                      <span className="font-mono font-black text-blue-600 text-lg">{p.palletNumber}</span>
                      <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-slate-400 uppercase">
                        {p._count.packages} Paczek
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedLoading(null)}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Zamknij Podgląd
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex items-center shadow-sm`}>
      <div className="text-2xl mr-3">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase opacity-60">{title}</p>
        <p className="text-xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
  );
}
