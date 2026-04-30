import { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/loadings/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center p-10">Ładowanie historii...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Historia Załadunków</h1>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Data zamknięcia</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Kierowca</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Pojazd</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Palety</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm">
                  {item.closedAt ? new Date(item.closedAt).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium">{item.driverName}</td>
                <td className="px-6 py-4">{item.vehicleRegistration}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{item._count.pallets}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedLoading(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Brak zamkniętych transportów w historii.</td>
              </tr>
            )}
          </tbody>
        </table>
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
