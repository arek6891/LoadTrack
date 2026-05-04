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
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Skanuj Paczkę</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tracking" className="block text-sm font-medium text-gray-700">
              Numer Trackingowy
            </label>
            <input
              id="tracking"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Zeskanuj lub wpisz numer..."
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Przetwarzanie...' : 'Zatwierdź Skan'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Ostatnio Zeskanowane</h3>
        <ul className="divide-y divide-gray-100">
          {scannedPackages.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4">Brak zeskanowanych paczek w tej sesji.</p>
          ) : (
            scannedPackages.map((pkg) => (
              <li key={pkg.id} className="py-3 flex justify-between items-center">
                <span className="font-mono text-sm">{pkg.trackingNumber}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {pkg.status}
                  </span>
                  <button 
                    onClick={() => printLabel('PACKAGE', pkg.trackingNumber)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-bold"
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
