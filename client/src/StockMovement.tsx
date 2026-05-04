import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockMovement: React.FC = () => {
  const [palletNumber, setPalletNumber] = useState('');
  const [locationName, setLocationName] = useState('');
  const [step, setStep] = useState<'PALLET' | 'LOCATION'>('PALLET');
  const [loading, setLoading] = useState(false);

  const handlePalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (palletNumber.trim()) {
      setStep('LOCATION');
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setLoading(true);

    try {
      await axios.post('/api/move/pallet', {
        palletNumber: palletNumber.trim(),
        locationName: locationName.trim(),
      });

      toast.success(`Paleta ${palletNumber} -> ${locationName}`);
      setPalletNumber('');
      setLocationName('');
      setStep('PALLET');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd podczas przenoszenia palety');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
          <span className="mr-2">🔄</span> Ruch Magazynowy
        </h2>

        <div className="flex justify-between mb-8 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black border-4 shadow-sm transition-colors ${step === 'PALLET' ? 'bg-blue-600 border-blue-200 text-white' : 'bg-green-600 border-green-200 text-white'}`}>
            1
          </div>
          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black border-4 shadow-sm transition-colors ${step === 'LOCATION' ? 'bg-blue-600 border-blue-200 text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
            2
          </div>
        </div>

        {step === 'PALLET' ? (
          <form onSubmit={handlePalletSubmit} className="space-y-6">
            <div className="text-center">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                KROK 1: SKANUJ PALETĘ
              </label>
              <input
                type="text"
                value={palletNumber}
                onChange={(e) => setPalletNumber(e.target.value)}
                className="w-full px-4 py-4 text-2xl border-2 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-100 text-center font-mono font-bold bg-blue-50/30"
                placeholder="PAL-..."
                autoFocus
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-5 rounded-xl font-black text-lg shadow-lg active:scale-[0.98] transition-all">
              DALEJ ➡️
            </button>
          </form>
        ) : (
          <form onSubmit={handleMoveSubmit} className="space-y-6">
            <div className="text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Wybrana Paleta</span>
              <p className="font-black text-xl text-blue-600 font-mono">{palletNumber}</p>
            </div>
            <div className="text-center">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                KROK 2: SKANUJ LOKALIZACJĘ
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-4 text-2xl border-2 border-green-500 rounded-xl focus:ring-4 focus:ring-green-100 text-center font-mono font-bold bg-green-50/30"
                placeholder="REG-..."
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setStep('PALLET')}
                className="w-1/3 bg-gray-100 text-gray-500 py-5 rounded-xl font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                COFNIJ
              </button>
              <button 
                disabled={loading}
                className="w-2/3 bg-green-600 text-white py-5 rounded-xl font-black text-lg shadow-lg active:scale-[0.98] transition-all disabled:bg-green-300"
              >
                {loading ? 'PRZETWARZANIE...' : 'ZATWIERDŹ ✅'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StockMovement;
