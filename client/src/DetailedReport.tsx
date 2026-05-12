import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface DetailedItem {
  type: string;
  trackingNumber: string;
  palletNumber: string;
  location: string;
  status: string;
  loading: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

type SortKey = 'type' | 'trackingNumber' | 'palletNumber' | 'location' | 'status' | 'createdAt' | 'createdBy';

export default function DetailedReport() {
  const [data, setData] = useState<DetailedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtry
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterLoading, setFilterLoading] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sortowanie
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/reports/detailed');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching detailed report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchType = filterType === 'ALL' || item.type === filterType;
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchSearch = item.trackingNumber.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          item.palletNumber.toLowerCase().includes(filterSearch.toLowerCase());
      const matchLoading = item.loading.toLowerCase().includes(filterLoading.toLowerCase());
      const matchCreator = item.createdBy.toLowerCase().includes(filterCreator.toLowerCase());
      
      const itemDate = new Date(item.createdAt);
      const matchDateFrom = !dateFrom || itemDate >= new Date(dateFrom);
      const matchDateTo = !dateTo || itemDate <= new Date(dateTo + 'T23:59:59');
      
      return matchType && matchStatus && matchSearch && matchLoading && matchCreator && matchDateFrom && matchDateTo;
    }).sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, filterType, filterStatus, filterSearch, filterLoading, filterCreator, dateFrom, dateTo, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      'Typ': item.type,
      'Nr Kartonu': item.trackingNumber,
      'Nr Palety': item.palletNumber,
      'Lokalizacja': item.location,
      'Status': item.status,
      'Załadunek': item.loading,
      'Data stworzenia': new Date(item.createdAt).toLocaleString(),
      'Stworzył(a)': item.createdBy,
      'Ostatnia zmiana': new Date(item.updatedAt).toLocaleString()
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raport Szczegółowy");

    const fileName = `LoadTrack_Detailed_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const calculateDays = (date: string) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Przygotowywanie danych szczegółowych...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">RAPORT SZCZEGÓŁOWY</h1>
          <p className="text-gray-500 text-sm mt-1">Kompletna historia i status wszystkich jednostek magazynowych.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <span>Eksportuj do Excel</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Zaawansowane Filtrowanie</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <FilterInput label="Szukaj (Nr Kartonu/Palety)" value={filterSearch} onChange={setFilterSearch} placeholder="Wpisz numer..." />
          <FilterInput label="Załadunek (Kierowca/Rej)" value={filterLoading} onChange={setFilterLoading} placeholder="Szukaj transportu..." />
          <FilterInput label="Użytkownik (Stworzył)" value={filterCreator} onChange={setFilterCreator} placeholder="Login..." />
          <FilterSelect 
            label="Typ" 
            value={filterType} 
            onChange={setFilterType} 
            options={[{val: 'ALL', label: 'Wszystko'}, {val: 'PACZKA', label: 'Paczki'}, {val: 'PALETA', label: 'Palety'}]} 
          />
          <FilterSelect 
            label="Status" 
            value={filterStatus} 
            onChange={setFilterStatus} 
            options={[{val: 'ALL', label: 'Wszystkie'}, {val: 'IN_STOCK', label: 'W magazynie'}, {val: 'LOADED', label: 'Wydane'}]} 
          />
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <FilterDate label="Data Od" value={dateFrom} onChange={setDateFrom} />
            <FilterDate label="Data Do" value={dateTo} onChange={setDateTo} />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0">
              <tr>
                <SortHeader label="Typ" currentKey={sortKey} targetKey="type" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Nr Kartonu" currentKey={sortKey} targetKey="trackingNumber" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Nr Palety" currentKey={sortKey} targetKey="palletNumber" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Miejsce" currentKey={sortKey} targetKey="location" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Status" currentKey={sortKey} targetKey="status" dir={sortDir} onClick={handleSort} />
                <th className="px-6 py-4">Załadunek</th>
                <SortHeader label="Czas stworzenia" currentKey={sortKey} targetKey="createdAt" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Login stworzenia" currentKey={sortKey} targetKey="createdBy" dir={sortDir} onClick={handleSort} />
                <th className="px-6 py-4">Dni w magazynie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group text-sm">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.type === 'PACZKA' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.trackingNumber}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.palletNumber}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-black font-mono">
                      {item.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${item.status === 'IN_STOCK' ? 'text-amber-600' : 'text-slate-400'}`}>
                      {item.status === 'IN_STOCK' ? 'Dostępny' : 'Wydany'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{item.loading}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString('pl-PL')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[11px] font-black uppercase">
                      {item.createdBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-black ${calculateDays(item.createdAt) > 7 ? 'text-red-500' : 'text-slate-400'}`}>
                      {calculateDays(item.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <p className="text-slate-400 font-medium italic">Brak wyników dla podanych filtrów.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <select 
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: any) => <option key={o.val} value={o.val}>{o.label}</option>)}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input 
        type="text"
        placeholder={placeholder}
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FilterDate({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input 
        type="date"
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SortHeader({ label, currentKey, targetKey, dir, onClick }: any) {
  const isActive = currentKey === targetKey;
  return (
    <th 
      className={`px-6 py-4 cursor-pointer transition-colors ${isActive ? 'text-blue-600 bg-blue-50/50' : 'hover:bg-slate-100'}`}
      onClick={() => onClick(targetKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-[10px]">{dir === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );
}
