import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFocusLock } from './hooks/useFocusLock';

interface Loading {
  id: string;
  driverName: string;
  vehicleRegistration: string;
  expectedPallets: string[];
  pallets?: { palletNumber: string }[];
  _count: { pallets: number };
}

const LoadingManager: React.FC = () => {
  const [loadings, setLoadings] = useState<Loading[]>([]);
  const [activeLoading, setActiveLoading] = useState<Loading | null>(null);
  const [driver, setDriver] = useState('');
  const [reg, setReg] = useState('');
  const [expectedRaw, setExpectedRaw] = useState('');
  const [palletScan, setPalletScan] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useFocusLock();

  const fetchLoadings = async () => {
    try {
      const response = await axios.get('/api/loadings');
      setLoadings(response.data);
    } catch (err) {
      console.error('Failed to fetch loadings');
    }
  };

  useEffect(() => {
    fetchLoadings();
  }, []);

  const handleStartLoading = async (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPallets = expectedRaw.split(/[\s,]+/).filter(p => p.trim() !== '');
    
    try {
      const response = await axios.post('/api/loadings', {
        driverName: driver,
        vehicleRegistration: reg,
        expectedPallets
      });
      setActiveLoading({ ...response.data, pallets: [] });
      setIsCreating(false);
      toast.success('Otwarto nowy transport');
      fetchLoadings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd przy otwieraniu załadunku');
    }
  };

  const handleScanPallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoading || !palletScan.trim()) return;

    try {
      const response = await axios.post('/api/loadings/add-pallet', {
        loadingId: activeLoading.id,
        palletNumber: palletScan.trim()
      });
      
      if (response.data.isExpected === false) {
        toast.error(`UWAGA: Paleta ${palletScan} nie znajduje się na liście planowanej!`, { duration: 5000 });
      } else {
        toast.success(`Paleta ${palletScan} załadowana!`);
      }

      setPalletScan('');
      
      setActiveLoading({
        ...activeLoading,
        _count: { pallets: (activeLoading._count?.pallets || 0) + 1 },
        pallets: [...(activeLoading.pallets || []), { palletNumber: palletScan.trim() }]
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd skanowania palety');
    }
  };

  const handleCloseLoading = async (force = false) => {
    if (!activeLoading) return;
    try {
      await axios.post(`/api/loadings/${activeLoading.id}/close`, { force });
      toast.success('Transport zamknięty i wydany');
      setActiveLoading(null);
      fetchLoadings();
    } catch (err: any) {
      if (err.response?.data?.error === 'INCOMPLETE_LOADING') {
        const missing = err.response.data.missingPallets.join(', ');
        if (confirm(`BRAKI! Brakuje palet: ${missing}. Czy mimo to zamknąć transport?`)) {
          handleCloseLoading(true);
        }
      } else {
        toast.error('Błąd przy zamykaniu załadunku');
      }
    }
  };

  const missingPallets = activeLoading?.expectedPallets.filter(
    exp => !activeLoading.pallets?.some(p => p.palletNumber === exp)
  ) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {!activeLoading && !isCreating ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🚛</span> Załadunki
            </h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-3 rounded-md font-bold text-sm shadow-sm active:bg-blue-700"
            >
              + NOWY
            </button>
          </div>
          
          <div className="grid gap-3">
            {loadings.length === 0 ? (
              <p className="text-center text-gray-500 py-12 bg-white rounded-lg border italic">Brak otwartych załadunków.</p>
            ) : (
              loadings.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center active:bg-gray-50 transition-colors">
                  <div className="flex-grow">
                    <p className="font-black text-xl text-gray-800 leading-none mb-1">{l.vehicleRegistration}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Kierowca: {l.driverName}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-[10px] font-black border ${
                      l.expectedPallets.length > 0 && l._count.pallets === l.expectedPallets.length
                        ? 'bg-green-100 border-green-200 text-green-800'
                        : 'bg-blue-100 border-blue-200 text-blue-800'
                    }`}>
                      {l._count.pallets} / {l.expectedPallets.length || '?'}
                    </div>
                    <button 
                      onClick={() => setActiveLoading({...l, pallets: []})}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-xs font-black shadow-sm"
                    >
                      WEJDŹ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : isCreating ? (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">➕</span> Nowy Transport
          </h2>
          <form onSubmit={handleStartLoading} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Numer Rejestracyjny</label>
              <input 
                type="text" 
                required 
                value={reg} 
                onChange={e => setReg(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-lg font-bold text-lg bg-gray-50 focus:border-blue-500"
                placeholder="REG..."
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kierowca</label>
              <input 
                type="text" 
                required 
                value={driver} 
                onChange={e => setDriver(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-lg font-bold bg-gray-50 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Planowane Palety</label>
              <textarea 
                value={expectedRaw} 
                onChange={e => setExpectedRaw(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-lg h-24 font-mono text-sm bg-gray-50 focus:border-blue-500"
                placeholder="PAL001, PAL002..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="w-1/3 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold"
              >
                Anuluj
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all"
              >
                OTWÓRZ ✅
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-600 p-4 rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest leading-none mb-1">Załadunek w toku</p>
                <h2 className="text-3xl font-black leading-none mb-1">{activeLoading?.vehicleRegistration}</h2>
                <p className="text-xs font-medium opacity-90">{activeLoading?.driverName}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 px-3 py-1 rounded-lg border border-white/30">
                  <p className="text-3xl font-black leading-none">
                    {activeLoading?._count.pallets}
                    {activeLoading?.expectedPallets && activeLoading.expectedPallets.length > 0 && <span className="text-sm opacity-60">/{activeLoading.expectedPallets.length}</span>}
                  </p>
                  <p className="text-[10px] uppercase font-bold opacity-80 leading-none mt-1">Sztuk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Ładuj Paletę</h3>
            <form onSubmit={handleScanPallet} className="space-y-4">
              <input 
                ref={inputRef}
                type="text" 
                value={palletScan}
                onChange={e => setPalletScan(e.target.value)}
                className="w-full border-4 border-blue-500 p-6 rounded-xl text-3xl font-mono font-bold bg-gray-50 focus:border-blue-600 focus:ring-8 focus:ring-blue-100 text-center"
                placeholder="SKANUJ PALETĘ..."
                autoFocus
                autoComplete="off"
              />
              <button className="w-full bg-green-600 text-white py-6 rounded-xl font-black text-2xl shadow-lg active:scale-95 transition-all">
                ŁADUJ (ENTER)
              </button>
            </form>
          </div>

          {activeLoading?.expectedPallets && activeLoading.expectedPallets.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Lista Kontrolna</h3>
              <div className="grid grid-cols-3 gap-2">
                {activeLoading?.expectedPallets.map(p => {
                  const isLoaded = activeLoading?.pallets?.some(lp => lp.palletNumber === p);
                  return (
                    <div key={p} className={`py-2 px-1 rounded-lg border text-center text-[10px] font-black font-mono shadow-sm ${
                      isLoaded ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => handleCloseLoading()}
              className={`w-full py-5 rounded-xl font-black text-lg transition-all shadow-lg active:scale-95 ${
                missingPallets.length === 0 || activeLoading?.expectedPallets.length === 0
                  ? 'bg-gray-800 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {missingPallets.length > 0 ? '❌ ZAMKNIJ Z BRAKAMI' : '✅ ZAMKNIJ I WYDAJ'}
            </button>
            <button 
              onClick={() => setActiveLoading(null)}
              className="w-full py-3 text-gray-500 font-bold text-sm"
            >
              Wróć do listy (bez zamykania)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingManager;
