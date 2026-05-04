import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { printLabel } from './printUtils';

interface Package {
  id: string;
  trackingNumber: string;
}

interface Pallet {
  id: string;
  palletNumber: string;
  packages: Package[];
}

const PalletBuilder: React.FC = () => {
  const [palletNumber, setPalletNumber] = useState('');
  const [activePallet, setActivePallet] = useState<Pallet | null>(null);
  const [packageNumber, setPackageNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!palletNumber.trim()) return;

    setLoading(true);
    try {
      // Próbujemy pobrać paletę, jeśli nie istnieje - tworzymy ją
      try {
        const response = await axios.get(`/api/pallets/${palletNumber.trim()}`);
        setActivePallet(response.data);
        toast.success(`Otwarto paletę: ${palletNumber}`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          const createResponse = await axios.post('/api/pallets', {
            palletNumber: palletNumber.trim(),
          });
          setActivePallet({ ...createResponse.data, packages: [] });
          toast.success(`Utworzono nową paletę: ${palletNumber}`);
        } else {
          throw err;
        }
      }
      setPalletNumber('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd podczas wybierania palety');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageNumber.trim() || !activePallet) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/pallets/add-package', {
        palletId: activePallet.id,
        trackingNumber: packageNumber.trim(),
      });
      
      setActivePallet({
        ...activePallet,
        packages: [response.data, ...activePallet.packages],
      });
      toast.success(`Dodano paczkę: ${packageNumber}`);
      setPackageNumber('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd podczas dodawania paczki');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!activePallet ? (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🏗️</span> Rozpocznij Paletę
          </h2>
          <form onSubmit={handlePalletSubmit} className="space-y-4">
            <input
              type="text"
              value={palletNumber}
              onChange={(e) => setPalletNumber(e.target.value)}
              placeholder="Zeskanuj nr palety..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              autoFocus
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Szukanie...' : 'OTWÓRZ / STWÓRZ PALETĘ'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-600 p-4 rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Aktywna Paleta</p>
                <h2 className="text-3xl font-black leading-none">{activePallet.palletNumber}</h2>
              </div>
              <button 
                onClick={() => setActivePallet(null)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-bold border border-white/30"
              >
                ZAKOŃCZ
              </button>
            </div>
            <button 
              onClick={() => printLabel('PALLET', activePallet.palletNumber)}
              className="w-full bg-white text-blue-600 py-3 rounded font-black text-sm shadow-md active:bg-blue-50"
            >
              🖨️ DRUKUJ ETYKIETĘ PALETY
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Dodaj Paczkę</h3>
            <form onSubmit={handlePackageSubmit} className="space-y-4">
              <input
                type="text"
                value={packageNumber}
                onChange={(e) => setPackageNumber(e.target.value)}
                placeholder="Zeskanuj nr paczki..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                autoFocus
              />
              <button
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-md font-bold text-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {loading ? 'Dodawanie...' : 'DODAJ PACZKĘ'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 text-sm">Zawartość Palety</h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {activePallet.packages.length} SZT.
              </span>
            </div>
            <ul className="divide-y divide-gray-200">
              {activePallet.packages.length === 0 ? (
                <li className="p-8 text-center text-gray-400 italic text-sm">Paleta jest jeszcze pusta.</li>
              ) : (
                activePallet.packages.map((pkg) => (
                  <li key={pkg.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px] font-bold border border-gray-200">
                        BOX
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-800">{pkg.trackingNumber}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PalletBuilder;
