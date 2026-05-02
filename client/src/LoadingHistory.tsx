import { useState, useEffect, useCallback } from 'react';
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

  const handleExportExcel = () => {
    const wsData = history.map(item => ({
      'Data zamknięcia': item.closedAt ? new Date(item.closedAt).toLocaleString() : 'N/A',
      'Kierowca': item.driverName,
      'Numer rejestracyjny': item.vehicleRegistration,
      'Liczba palet': item._count.pallets,
      'ID Transportu': item.id
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historia Załadunków");

    const fileName = `LoadTrack_Historia_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Historia Załadunków</h1>
        <button 
          onClick={handleExportExcel}
          disabled={history.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
        >
          <span>📊 Eksportuj do Excela</span>
        </button>
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data od</label>
          <input 
            type="date"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data do</label>
          <input 
            type="date"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kierowca / Pojazd</label>
          <input 
            type="text"
            placeholder="Szukaj po nazwisku..."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Data zamknięcia</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Kierowca</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Pojazd</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center">Palety</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Ładowanie danych...</td>
                </tr>
              ) : history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    {item.closedAt ? new Date(item.closedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-medium">{item.driverName}</td>
                  <td className="px-6 py-4">{item.vehicleRegistration}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600 text-center">{item._count.pallets}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedLoading(item)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Szczegóły
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium">Brak wyników dla wybranych kryteriów.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm text-gray-600">
          Łącznie transportów: <strong>{history.length}</strong>
        </div>
      </div>

      {/* Modal szczegółów */}
      {selectedLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Szczegóły Transportu</h2>
              <button onClick={() => setSelectedLoading(null)} className="text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 uppercase text-xs font-bold">Kierowca</p>
                  <p className="text-lg font-semibold">{selectedLoading.driverName}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-xs font-bold">Pojazd</p>
                  <p className="text-lg font-semibold">{selectedLoading.vehicleRegistration}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-xs font-bold">Data zamknięcia</p>
                  <p>{new Date(selectedLoading.closedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-xs font-bold">Łącznie palet</p>
                  <p>{selectedLoading._count.pallets}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-2 border-b pb-1">Lista Palet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedLoading.pallets.map(p => (
                    <div key={p.id} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between">
                      <span className="font-mono font-bold text-blue-700">{p.palletNumber}</span>
                      <span className="text-xs text-gray-500">{p._count.packages} paczek</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 text-right">
              <button 
                onClick={() => setSelectedLoading(null)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-bold"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
