import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  _count: {
    packages: number;
    pallets: number;
  };
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (err) {
      console.error('Failed to fetch locations');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);

    try {
      await axios.post('/api/locations', { name: newName.trim() });
      toast.success(`Dodano lokalizację: ${newName}`);
      setNewName('');
      fetchLocations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd podczas dodawania lokalizacji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Zarządzanie Lokalizacjami</h2>
        
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Np. A-01-01, Rampa-1..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            Dodaj
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Palety</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paczki</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">Brak zdefiniowanych lokalizacji.</td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{loc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{loc._count.pallets}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{loc._count.packages}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      loc._count.packages + loc._count.pallets > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {loc._count.packages + loc._count.pallets > 0 ? 'Zajęta' : 'Wolna'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;
