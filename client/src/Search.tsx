import React, { useState } from 'react';
import axios from 'axios';

const Search: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'ADMIN' || userRole === 'LEADER';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`/api/search?q=${query.trim()}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd podczas wyszukiwania');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!result || !window.confirm('Czy na pewno chcesz usunąć ten element?')) return;

    try {
      const endpoint = result.type === 'package' ? `/api/packages/${result.data.id}` : `/api/pallets/${result.data.id}`;
      await axios.delete(endpoint);
      alert('Usunięto pomyślnie');
      setResult(null);
      setQuery('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Błąd podczas usuwania');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-green-100 text-green-800';
      case 'LOADED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-bold mb-4">Wyszukiwarka</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Wpisz numer paczki lub palety..."
            className="flex-grow border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
          />
          <button className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            SZUKAJ
          </button>
        </form>
      </div>

      {loading && <div className="text-center py-10">Szukanie...</div>}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Wynik: {result.type === 'package' ? 'Paczka' : 'Paleta'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(result.data.status)}`}>
              {result.data.status}
            </span>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Numer identyfikacyjny</p>
                <p className="text-2xl font-black font-mono">
                  {result.type === 'package' ? result.data.trackingNumber : result.data.palletNumber}
                </p>
              </div>
              {isAdmin && (
                <button 
                  onClick={handleDelete}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded border border-red-100 text-xs font-bold hover:bg-red-100"
                >
                  USUŃ Z SYSTEMU
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Lokalizacja</p>
                <p className="font-bold text-lg">{result.data.location?.name || 'Brak (Poza stanem)'}</p>
              </div>
              
              {result.type === 'package' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold">Paleta</p>
                  <p className="font-bold text-lg">{result.data.pallet?.palletNumber || 'Brak'}</p>
                </div>
              )}

              {result.type === 'pallet' && result.data.loading && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-500 uppercase font-bold">Transport</p>
                  <p className="font-bold text-lg text-blue-700">{result.data.loading.vehicleRegistration}</p>
                </div>
              )}
            </div>

            {result.type === 'pallet' && (
              <div className="mt-6">
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Zawartość ({result.data.packages?.length || 0} paczek)</h4>
                <div className="max-h-48 overflow-y-auto">
                  <ul className="divide-y text-sm">
                    {result.data.packages?.map((p: any) => (
                      <li key={p.id} className="py-2 font-mono flex justify-between">
                        <span>{p.trackingNumber}</span>
                        <span className="text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                    {(!result.data.packages || result.data.packages.length === 0) && (
                      <li className="py-2 text-gray-400 italic">Paleta jest pusta.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
