import React, { useState } from 'react';
import axios from 'axios';

const StockMovement: React.FC = () => {
  const [palletNumber, setPalletNumber] = useState('');
  const [locationName, setLocationName] = useState('');
  const [step, setStep] = useState<'PALLET' | 'LOCATION'>('PALLET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (palletNumber.trim()) {
      setStep('LOCATION');
      setError(null);
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post('/api/move/pallet', {
        palletNumber: palletNumber.trim(),
        locationName: locationName.trim(),
      });

      setSuccess(`Paleta ${palletNumber} została przeniesiona do ${locationName}`);
      setPalletNumber('');
      setLocationName('');
      setStep('PALLET');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd podczas przenoszenia palety');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">Ruch Magazynowy</h2>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === 'PALLET' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-green-500 border-green-500 text-white'}`}>
            1
          </div>
          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === 'LOCATION' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
            2
          </div>
        </div>

        {step === 'PALLET' ? (
          <form onSubmit={handlePalletSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center uppercase tracking-wider">
              KROK 1: Skanuj Paletę
            </label>
            <input
              type="text"
              value={palletNumber}
              onChange={(e) => setPalletNumber(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-blue-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
              placeholder="PAL-XXXX"
              autoFocus
            />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              DALEJ
            </button>
          </form>
        ) : (
          <form onSubmit={handleMoveSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-xs text-gray-500 uppercase">Wybrana Paleta:</span>
              <p className="font-bold text-blue-600">{palletNumber}</p>
            </div>
            <label className="block text-sm font-medium text-gray-700 text-center uppercase tracking-wider">
              KROK 2: Skanuj Lokalizację
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-blue-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
              placeholder="A-01-01"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setStep('PALLET')}
                className="w-1/3 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                COFNIJ
              </button>
              <button 
                disabled={loading}
                className="w-2/3 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-green-300"
              >
                {loading ? 'PRZENOSZENIE...' : 'POTWIERDŹ'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm text-center font-medium animate-pulse">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovement;
