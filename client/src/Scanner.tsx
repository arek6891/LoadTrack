import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { printLabel } from './printUtils';
import { useFocusLock } from './hooks/useFocusLock';

interface Package {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
}

const Scanner: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [scannedPackages, setScannedPackages] = useState<Package[]>([]);
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);
  const queryClient = useQueryClient();
  const inputRef = useFocusLock();

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const scanMutation = useMutation({
    mutationFn: async (number: string) => {
      const response = await axios.post('/api/packages', {
        trackingNumber: number,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setScannedPackages([data, ...scannedPackages]);
      setFlash('success');
      toast.success(`Zeskanowano: ${data.trackingNumber}`, { duration: 1000 });
      setTrackingNumber('');
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      // Sygnał dźwiękowy (opcjonalny, jeśli przeglądarka pozwoli)
      playAudio(true);
    },
    onError: (err: any) => {
      setFlash('error');
      const errorMessage = err.response?.data?.error || 'Błąd skanowania';
      toast.error(errorMessage);
      setTrackingNumber(''); // Czyścimy błędny kod, by skaner mógł czytać dalej
      playAudio(false);
    }
  });

  const playAudio = (success: boolean) => {
    try {
      const audio = new Audio(success ? '/success.mp3' : '/error.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignoruj błędy autoplay
    } catch (e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim() || scanMutation.isPending) return;
    scanMutation.mutate(trackingNumber.trim());
  };

  return (
    <div className={`max-w-md mx-auto space-y-4 transition-colors duration-300 ${
      flash === 'success' ? 'bg-green-100' : flash === 'error' ? 'bg-red-100' : ''
    } p-2 rounded-xl min-h-[80vh]`}>
      
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-2 border-gray-200">
        <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">🔍</span> SKANER
          </div>
          {scanMutation.isPending && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded animate-pulse">SYNC...</span>}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              id="tracking"
              type="text"
              inputMode="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={scanMutation.isPending}
              className={`block w-full px-4 py-6 text-3xl border-4 rounded-xl shadow-inner text-center font-mono font-bold transition-all ${
                flash === 'success' ? 'border-green-500 bg-green-50' : 
                flash === 'error' ? 'border-red-500 bg-red-50' : 
                'border-blue-500 bg-gray-50 focus:border-blue-600 focus:ring-8 focus:ring-blue-100'
              }`}
              placeholder="CZEKAM NA SKAN..."
              autoComplete="off"
            />
          </div>
          
          <button
            type="submit"
            disabled={scanMutation.isPending || !trackingNumber.trim()}
            className="w-full py-6 px-4 rounded-xl shadow-lg text-2xl font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-300 uppercase"
          >
            ZATWIERDŹ (ENTER)
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-sm font-black mb-3 text-gray-400 uppercase tracking-widest flex justify-between items-center">
          <span>Ostatnie skany</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{scannedPackages.length}</span>
        </h3>
        <div className="max-h-[40vh] overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {scannedPackages.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-12">Brak paczek w tej sesji.</p>
            ) : (
              scannedPackages.map((pkg) => (
                <li key={pkg.id} className="py-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-mono text-xl font-bold text-gray-900">{pkg.trackingNumber}</span>
                    <span className="text-[10px] text-gray-400">{new Date(pkg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => printLabel('PACKAGE', pkg.trackingNumber)}
                      className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm active:bg-gray-800"
                    >
                      DRUK
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
