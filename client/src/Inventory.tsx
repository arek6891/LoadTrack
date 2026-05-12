import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFocusLock } from './hooks/useFocusLock';

interface InventorySession {
  id: string;
  status: 'OPEN' | 'CLOSED';
  _count: { counts: number };
}

const Inventory: React.FC = () => {
  const [session, setSession] = useState<InventorySession | null>(null);
  const [locationName, setLocationName] = useState('');
  const [palletScan, setPalletScan] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useFocusLock();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLeaderOrAdmin = user.role === 'LEADER' || user.role === 'ADMIN';

  const fetchActiveSession = async () => {
    try {
      const response = await axios.get('/api/inventory/active');
      setSession(response.data);
    } catch (err) {
      console.error('Failed to fetch active session');
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/inventory/start');
      setSession(response.data);
      setSummary(null);
      toast.success('Inwentaryzacja rozpoczęta');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd rozpoczynania sesji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !palletScan.trim() || !locationName.trim()) {
      toast.error('Podaj lokalizację i zeskanuj paletę');
      return;
    }

    try {
      const response = await axios.post('/api/inventory/record', {
        sessionId: session.id,
        palletNumber: palletScan.trim(),
        locationName: locationName.trim()
      });

      if (response.data.isDiscrepancy) {
        toast.error(`ROZBIEŻNOŚĆ! Paleta ${palletScan} nie powinna być w ${locationName}`, { duration: 4000 });
      } else {
        toast.success(`OK: ${palletScan}`);
      }

      setPalletScan('');
      setSession({
        ...session,
        _count: { counts: (session._count?.counts || 0) + 1 }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd zapisu skanu');
    }
  };

  const handleCloseSession = async () => {
    if (!session || !confirm('Czy na pewno chcesz zakończyć inwentaryzację i wygenerować raport?')) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/inventory/${session.id}/close`);
      setSummary(response.data.summary);
      setSession(null);
      toast.success('Inwentaryzacja zakończona');
    } catch (err: any) {
      toast.error('Błąd zamykania sesji');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">📋</span> Inwentaryzacja
        </h2>
        <p className="text-xs text-gray-500">Weryfikacja stanu faktycznego z systemowym.</p>
      </div>

      {!session ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center space-y-4">
          {summary ? (
            <div className="text-left space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Ostatni Raport</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-black">{summary.totalScanned}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-500">Zeskanowano</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-black text-red-600">{summary.discrepancies}</p>
                  <p className="text-[10px] uppercase font-bold text-red-500">Rozbieżności</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-black text-orange-600">{summary.missing.length}</p>
                  <p className="text-[10px] uppercase font-bold text-orange-500">Brakujące</p>
                </div>
              </div>
              
              {summary.missing.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Brakujące Palety (niezeskanowane):</p>
                  <div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2">
                    {summary.missing.map((p: any) => (
                      <div key={p.palletNumber} className="text-xs py-1 border-b last:border-0 flex justify-between">
                        <span className="font-mono font-bold">{p.palletNumber}</span>
                        <span className="text-gray-400">Lokalizacja: {p.location?.name || '?'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic py-10">Brak aktywnej sesji inwentaryzacyjnej.</p>
          )}
          
          {isLeaderOrAdmin && (
            <button 
              onClick={handleStartSession}
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Uruchamianie...' : 'ROZPOCZNIJ NOWĄ SESJĘ'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-600 p-4 rounded-lg shadow-lg text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest leading-none mb-1">Aktywna Sesja</p>
              <h2 className="text-lg font-black leading-none">SESJA: {session.id.substring(0, 8)}</h2>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-lg border border-white/30 text-center">
              <p className="text-2xl font-black leading-none">{session._count?.counts || 0}</p>
              <p className="text-[10px] uppercase font-bold opacity-80 leading-none mt-1">Skanów</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Aktualna Lokalizacja</label>
              <input 
                type="text" 
                value={locationName}
                onChange={e => setLocationName(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-200 p-3 rounded-lg font-bold text-xl bg-gray-50 focus:border-blue-500 text-center"
                placeholder="WPISZ LOKALIZACJĘ (np. A-01-01)"
              />
            </div>

            <form onSubmit={handleRecordCount} className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skanuj Paletę</label>
              <input 
                ref={inputRef}
                type="text" 
                value={palletScan}
                onChange={e => setPalletScan(e.target.value)}
                className="w-full border-4 border-blue-500 p-6 rounded-xl text-3xl font-mono font-bold bg-gray-50 focus:border-blue-600 focus:ring-8 focus:ring-blue-100 text-center"
                placeholder="SKANUJ PALETĘ..."
                disabled={!locationName}
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-6 rounded-xl font-black text-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                disabled={!locationName || !palletScan}
              >
                POTWIERDŹ (ENTER)
              </button>
            </form>
          </div>

          {isLeaderOrAdmin && (
            <button 
              onClick={handleCloseSession}
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all"
            >
              ZAKOŃCZ I GENERUJ RAPORT
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;
