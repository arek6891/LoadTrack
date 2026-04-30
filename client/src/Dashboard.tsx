import { useState, useEffect } from 'react';
import axios from 'axios';

interface Stats {
  packages: { status: string; _count: number }[];
  pallets: { status: string; _count: number }[];
  locations: { total: number; occupied: number };
  today: { closedLoadings: number; loadedPallets: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center p-10">Ładowanie statystyk...</div>;
  if (!stats) return <div className="text-center p-10 text-red-600">Błąd ładowania danych.</div>;

  const getCount = (arr: { status: string; _count: number }[], status: string) => {
    return arr.find(i => i.status === status)?._count || 0;
  };

  const inStockPackages = getCount(stats.packages, 'IN_STOCK');
  const loadedPackages = getCount(stats.packages, 'LOADED');
  const inStockPallets = getCount(stats.pallets, 'IN_STOCK');
  const loadedPalletsTotal = getCount(stats.pallets, 'LOADED');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Magazynowy</h1>

      {/* Górne karty z podsumowaniem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Paczki w Magazynie" 
          value={inStockPackages} 
          subValue={`${loadedPackages} wyjechało`}
          color="blue"
        />
        <StatCard 
          title="Palety w Magazynie" 
          value={inStockPallets} 
          subValue={`${loadedPalletsTotal} wyjechało`}
          color="green"
        />
        <StatCard 
          title="Zajętość Regałów" 
          value={`${stats.locations.occupied} / ${stats.locations.total}`} 
          subValue={`${Math.round((stats.locations.occupied / stats.locations.total) * 100) || 0}% zapełnienia`}
          color="purple"
        />
        <StatCard 
          title="Dzisiejszy Załadunek" 
          value={stats.today.loadedPallets} 
          subValue={`${stats.today.closedLoadings} transporty`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Szczegóły Paczek */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Status Paczek</h2>
          <div className="space-y-4">
            <ProgressBar label="W Magazynie (IN_STOCK)" value={inStockPackages} total={inStockPackages + loadedPackages} color="bg-blue-500" />
            <ProgressBar label="Załadowane (LOADED)" value={loadedPackages} total={inStockPackages + loadedPackages} color="bg-gray-400" />
          </div>
        </div>

        {/* Szczegóły Palet */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Status Palet</h2>
          <div className="space-y-4">
            <ProgressBar label="W Magazynie (IN_STOCK)" value={inStockPallets} total={inStockPallets + loadedPalletsTotal} color="bg-green-500" />
            <ProgressBar label="Załadowane (LOADED)" value={loadedPalletsTotal} total={inStockPallets + loadedPalletsTotal} color="bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, color }: { title: string; value: string | number; subValue: string; color: string }) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    purple: 'border-purple-500 text-purple-600',
    orange: 'border-orange-500 text-orange-600',
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${colors[color]} border-gray-200`}>
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-2">{subValue}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
