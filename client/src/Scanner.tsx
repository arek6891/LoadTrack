import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { printLabel } from './printUtils';

interface Package {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
}

const Scanner: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [scannedPackages, setScannedPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post('/api/packages', {
        trackingNumber: trackingNumber.trim(),
      });

      setScannedPackages([response.data, ...scannedPackages]);
      toast.success(`Zeskanowano pomyślnie: ${trackingNumber}`);
      setTrackingNumber('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Wystąpił błąd podczas skanowania';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">🔍</span> Skanuj Paczkę
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-1">
              Numer Trackingowy
            </label>
            <input
              id="tracking"
              type="text"
              inputMode="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              placeholder="Zeskanuj numer..."
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Przetwarzanie...' : 'ZATWIERDŹ SKAN'}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 flex justify-between items-center">
          <span>Ostatnio Zeskanowane</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{scannedPackages.length}</span>
        </h3>
        <ul className="divide-y divide-gray-100">
          {scannedPackages.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-8">Brak zeskanowanych paczek w tej sesji.</p>
          ) : (
            scannedPackages.map((pkg) => (
              <li key={pkg.id} className="py-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-mono text-base font-bold text-gray-900">{pkg.trackingNumber}</span>
                  <span className="text-[10px] text-gray-400">{new Date(pkg.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold uppercase">
                    {pkg.status}
                  </span>
                  <button 
                    onClick={() => printLabel('PACKAGE', pkg.trackingNumber)}
                    className="text-[10px] bg-gray-800 text-white hover:bg-black px-3 py-2 rounded font-black shadow-sm"
                  >
                    DRUKUJ
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Scanner;
