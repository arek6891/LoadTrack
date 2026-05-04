import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    <div className="max-w-4xl mx-auto space-y-6">
      {!activeLoading && !isCreating ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold">Aktywne Załadunki</h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700"
            >
              + Nowy Transport
            </button>
          </div>
          
          <div className="grid gap-4">
            {loadings.length === 0 ? (
              <p className="text-center text-gray-500 py-10 bg-white rounded-lg border">Brak otwartych załadunków.</p>
            ) : (
              loadings.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{l.vehicleRegistration}</p>
                    <p className="text-sm text-gray-600">Kierowca: {l.driverName}</p>
                    {l.expectedPallets.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Plan: {l.expectedPallets.length} palet
                      </p>
                    )}
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      l.expectedPallets.length > 0 && l._count.pallets === l.expectedPallets.length
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {l._count.pallets} / {l.expectedPallets.length || '?'} palet
                    </span>
                    <button 
                      onClick={() => setActiveLoading({...l, pallets: []})} // Tu by się przydało pobranie palet
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Kontynuuj
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : isCreating ? (
        <div className="bg-white p-6 rounded-lg shadow-md border max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Nowy Transport</h2>
          <form onSubmit={handleStartLoading} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Numer Rejestracyjny</label>
              <input 
                type="text" 
                required 
                value={reg} 
                onChange={e => setReg(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                placeholder="np. WA 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imię i Nazwisko Kierowcy</label>
              <input 
                type="text" 
                required 
                value={driver} 
                onChange={e => setDriver(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Planowane Palety (opcjonalnie, oddzielone spacją/przecinkiem)</label>
              <textarea 
                value={expectedRaw} 
                onChange={e => setExpectedRaw(e.target.value)}
                className="w-full border p-2 rounded mt-1 h-24 font-mono text-sm"
                placeholder="PAL001, PAL002, ..."
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="w-1/2 bg-gray-200 py-2 rounded font-bold"
              >
                Anuluj
              </button>
              <button 
                type="submit" 
                className="w-1/2 bg-blue-600 text-white py-2 rounded font-bold"
              >
                Otwórz
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-600 p-6 rounded-lg shadow-md text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm uppercase font-bold">Załadunek w toku</p>
                <h2 className="text-3xl font-black">{activeLoading?.vehicleRegistration}</h2>
                <p className="mt-1">{activeLoading?.driverName}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">
                  {activeLoading?._count.pallets}
                  {activeLoading?.expectedPallets && activeLoading.expectedPallets.length > 0 && <span className="text-xl opacity-60"> / {activeLoading.expectedPallets.length}</span>}
                </p>
                <p className="text-xs uppercase font-bold opacity-80">Palet na aucie</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-bold mb-4">Skanuj Paletę na Auto</h3>
            <form onSubmit={handleScanPallet} className="flex gap-2">
              <input 
                type="text" 
                value={palletScan}
                onChange={e => setPalletScan(e.target.value)}
                className="flex-grow border-2 border-blue-100 p-3 rounded-lg text-lg font-mono"
                placeholder="Numer palety..."
                autoFocus
              />
              <button className="bg-green-600 text-white px-6 rounded-lg font-bold">ŁADUJ</button>
            </form>
          </div>

          {activeLoading?.expectedPallets && activeLoading.expectedPallets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-bold mb-4">Status Kompletności</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activeLoading?.expectedPallets.map(p => {
                  const isLoaded = activeLoading?.pallets?.some(lp => lp.palletNumber === p);
                  return (
                    <div key={p} className={`p-2 rounded border text-center text-sm font-mono ${
                      isLoaded ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button 
            onClick={() => handleCloseLoading()}
            className={`w-full py-4 rounded-lg font-black text-lg transition-colors shadow-lg ${
              missingPallets.length === 0 || activeLoading?.expectedPallets.length === 0
                ? 'bg-gray-800 text-white hover:bg-black'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {missingPallets.length > 0 ? 'ZAMKNIJ MIMO BRAKÓW' : 'ZAMKNIJ ZAŁADUNEK I WYDAJ AUTO'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingManager;
