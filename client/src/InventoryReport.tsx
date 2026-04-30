import { useState, useEffect } from 'react';
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

export default function InventoryReport() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtry
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

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

  const filteredData = data.filter(item => {
    const matchType = filterType === 'ALL' || item.type === filterType;
    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchLocation = item.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchSearch = item.number.toLowerCase().includes(filterSearch.toLowerCase()) || 
                        item.parentPallet.toLowerCase().includes(filterSearch.toLowerCase());
    
    return matchType && matchStatus && matchLocation && matchSearch;
  });

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

    const fileName = `LoadTrack_Raport_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) return <div className="text-center p-10">Generowanie raportu...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Raport Stanu Magazynu</h1>
        <button 
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2"
        >
          <span>📊 Eksportuj do Excela (.xlsx)</span>
        </button>
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Typ jednostki</label>
          <select 
            className="w-full p-2 border rounded"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Wszystko</option>
            <option value="PACZKA">Paczki</option>
            <option value="PALETA">Palety</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select 
            className="w-full p-2 border rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Wszystkie</option>
            <option value="IN_STOCK">W magazynie</option>
            <option value="LOADED">Wydane</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lokalizacja</label>
          <input 
            type="text"
            placeholder="Szukaj lokalizacji..."
            className="w-full p-2 border rounded"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Numer (Paczka/Paleta)</label>
          <input 
            type="text"
            placeholder="Szukaj numeru..."
            className="w-full p-2 border rounded"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Typ</th>
                <th className="px-6 py-3">Numer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Paleta</th>
                <th className="px-6 py-3">Lokalizacja</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'PACZKA' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">{item.number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'IN_STOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                      {item.status === 'IN_STOCK' ? 'W magazynie' : 'Wydane'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.parentPallet}</td>
                  <td className="px-6 py-4">{item.location}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Brak wyników spełniających wybrane kryteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm text-gray-600">
          Znaleziono: <strong>{filteredData.length}</strong> pozycji
        </div>
      </div>
    </div>
  );
}
