import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  details: string;
  userId: string;
  user?: {
    username: string;
  };
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/audit-logs', {
        params: { 
          entity: entityFilter || undefined,
          limit: 100 
        }
      });
      setLogs(response.data);
    } catch (err: any) {
      toast.error('Błąd podczas pobierania logów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case 'PACKAGE': return 'bg-blue-100 text-blue-800';
      case 'PALLET': return 'bg-green-100 text-green-800';
      case 'LOADING': return 'bg-yellow-100 text-yellow-800';
      case 'USER': return 'bg-purple-100 text-purple-800';
      case 'LOCATION': return 'bg-orange-100 text-orange-800';
      case 'TEMPLATE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtruj typ:</label>
          <select 
            className="p-2 border rounded text-sm"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">Wszystkie</option>
            <option value="PACKAGE">Paczki</option>
            <option value="PALLET">Palety</option>
            <option value="LOADING">Załadunki</option>
            <option value="USER">Użytkownicy</option>
            <option value="LOCATION">Lokalizacje</option>
            <option value="TEMPLATE">Szablony</option>
          </select>
        </div>
        <button 
          onClick={fetchLogs}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded font-medium"
        >
          Odśwież
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Ładowanie logów...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Data i Czas</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Użytkownik</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Typ</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Akcja</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Szczegóły</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                    Brak logów do wyświetlenia
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {log.user?.username || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getEntityBadgeColor(log.entity)}`}>
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
