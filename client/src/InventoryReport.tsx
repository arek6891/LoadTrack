import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface InventoryItem {
  type: string;
  number: string;
  status: string;
  parentPallet: string;
  location: string;
  createdAt: string;
}

type SortKey = 'type' | 'number' | 'status' | 'location' | 'createdAt';

export default function InventoryReport() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtry
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Sortowanie
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/reports/inventory');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
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
      const matchLocation = item.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchSearch = item.number.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          item.parentPallet.toLowerCase().includes(filterSearch.toLowerCase());
      
      return matchType && matchStatus && matchLocation && matchSearch;
    }).sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, filterType, filterStatus, filterLocation, filterSearch, sortKey, sortDir]);

  // Statystyki
  const stats = useMemo(() => {
    const total = filteredData.length;
    const inStock = filteredData.filter(i => i.status === 'IN_STOCK').length;
    const packages = filteredData.filter(i => i.type === 'PACZKA').length;
    const pallets = filteredData.filter(i => i.type === 'PALETA').length;
    const uniqueLocations = new Set(filteredData.map(i => i.location).filter(l => l !== '-')).size;

    return { total, inStock, packages, pallets, uniqueLocations };
  }, [filteredData]);

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
      'Numer': item.number,
      'Status': item.status,
      'Paleta nadrzędna': item.parentPallet,
      'Lokalizacja': item.location,
      'Data dodania': new Date(item.createdAt).toLocaleString()
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stan Magazynu");

    const fileName = `LoadTrack_Stan_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Generowanie zaawansowanego raportu...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">STAN MAGAZYNU</h1>
          <p className="text-gray-500 text-sm mt-1">Podgląd rzeczywisty wszystkich jednostek logistycznych.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <span>Pobierz XLSX</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Wszystkie" value={stats.total} icon="📊" color="blue" />
        <KPICard title="W Magazynie" value={stats.inStock} icon="🏠" color="green" />
        <KPICard title="Lokalizacje" value={stats.uniqueLocations} icon="📍" color="purple" />
        <KPICard title="Paczki / Palety" value={`${stats.packages} / ${stats.pallets}`} icon="📦" color="orange" />
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Filtrowanie Danych</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FilterSelect 
            label="Typ Jednostki" 
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
          <FilterInput label="Lokalizacja" value={filterLocation} onChange={setFilterLocation} placeholder="REG-01..." />
          <FilterInput label="Szukaj numeru" value={filterSearch} onChange={setFilterSearch} placeholder="Kod kreskowy..." />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0">
              <tr>
                <SortHeader label="Typ" currentKey={sortKey} targetKey="type" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Numer Jednostki" currentKey={sortKey} targetKey="number" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Status" currentKey={sortKey} targetKey="status" dir={sortDir} onClick={handleSort} />
                <th className="px-6 py-4">Paleta Nadrz.</th>
                <SortHeader label="Lokalizacja" currentKey={sortKey} targetKey="location" dir={sortDir} onClick={handleSort} />
                <SortHeader label="Data Dodania" currentKey={sortKey} targetKey="createdAt" dir={sortDir} onClick={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.type === 'PACZKA' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-slate-800 text-base">{item.number}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${item.status === 'IN_STOCK' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-sm font-bold text-slate-600">
                        {item.status === 'IN_STOCK' ? 'Dostępny' : 'Wydany'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.parentPallet}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-black font-mono">
                      {item.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500">
          <span>WYGENEROWANO: {new Date().toLocaleTimeString()}</span>
          <span>WYNIKÓW: {filteredData.length}</span>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: 'blue' | 'green' | 'purple' | 'orange' }) {
  const colors = {
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
