import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Stats {
  packages: { status: string; _count: number }[];
  pallets: { status: string; _count: number }[];
  locations: { total: number; occupied: number };
  today: { closedLoadings: number; loadedPallets: number };
}

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats');
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (isError || !stats) return <div className="text-center p-10 text-red-600 font-bold bg-red-50 rounded-xl">Błąd ładowania danych statystycznych.</div>;

  const getCount = (arr: { status: string; _count: number }[] | undefined, status: string) => {
    return arr?.find(i => i.status === status)?._count || 0;
  };

  const inStockPackages = getCount(stats?.packages, 'IN_STOCK');
  const loadedPackages = getCount(stats?.packages, 'LOADED');
  const inStockPallets = getCount(stats?.pallets, 'IN_STOCK');
  const loadedPalletsTotal = getCount(stats?.pallets, 'LOADED');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">PULPIT STEROWNICZY</h1>
          <p className="text-slate-500 font-medium">Monitorowanie operacji LoadTrack w czasie rzeczywistym.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ostatnia aktualizacja</p>
          <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Paczki (Magazyn)" value={inStockPackages} subValue={`${loadedPackages} wydano`} color="blue" icon="📦" />
        <StatCard title="Palety (Magazyn)" value={inStockPallets} subValue={`${loadedPalletsTotal} wydano`} color="green" icon="🧱" />
        <StatCard title="Zajętość Regałów" value={`${stats?.locations?.occupied || 0} / ${stats?.locations?.total || 0}`} subValue={`${Math.round(((stats?.locations?.occupied || 0) / (stats?.locations?.total || 1)) * 100) || 0}%`} color="purple" icon="📍" />
        <StatCard title="Dzisiejsze Wydania" value={stats?.today?.loadedPallets || 0} subValue={`${stats?.today?.closedLoadings || 0} transporty`} color="orange" icon="🚚" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Paczek */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Status Wszystkich Paczek
          </h2>
          <div className="space-y-6">
            <ProgressBar label="W Magazynie (IN_STOCK)" value={inStockPackages} total={inStockPackages + loadedPackages} color="bg-blue-600" />
            <ProgressBar label="Załadowane (LOADED)" value={loadedPackages} total={inStockPackages + loadedPackages} color="bg-slate-300" />
          </div>
        </div>

        {/* Status Palet */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Status Jednostek Paletowych
          </h2>
          <div className="space-y-6">
            <ProgressBar label="W Magazynie (IN_STOCK)" value={inStockPallets} total={inStockPallets + loadedPalletsTotal} color="bg-emerald-500" />
            <ProgressBar label="Załadowane (LOADED)" value={loadedPalletsTotal} total={inStockPallets + loadedPalletsTotal} color="bg-slate-300" />
          </div>
        </div>
      </div>

      {/* Szybkie Akcje / Raporty */}
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-2">Raporty i Narzędzia</h2>
          <p className="text-slate-400 mb-6 max-w-md text-sm font-medium">Uzyskaj szczegółowy wgląd w operacje magazynowe i wyeksportuj dane do plików zewnętrznych.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/detailed-report" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition-all border border-white/5 hover:border-white/20">
              <span className="text-3xl bg-blue-500/20 p-2 rounded-xl">📊</span>
              <div>
                <p className="text-white font-black text-sm">Raport Szczegółowy</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Paczki, Loginy, Załadunki</p>
              </div>
            </Link>
            <Link to="/report" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition-all border border-white/5 hover:border-white/20">
              <span className="text-3xl bg-emerald-500/20 p-2 rounded-xl">📦</span>
              <div>
                <p className="text-white font-black text-sm">Stan Magazynu</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Aktualne zapasy i regały</p>
              </div>
            </Link>
            <Link to="/history" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition-all border border-white/5 hover:border-white/20">
              <span className="text-3xl bg-amber-500/20 p-2 rounded-xl">🚛</span>
              <div>
                <p className="text-white font-black text-sm">Historia Wydań</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Archiwum transportów</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, color, icon }: { title: string; value: string | number; subValue: string; color: string; icon: string }) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50/30',
    green: 'border-emerald-500 text-emerald-600 bg-emerald-50/30',
    purple: 'border-purple-500 text-purple-600 bg-purple-50/30',
    orange: 'border-orange-500 text-orange-600 bg-orange-50/30',
  };

  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 ${colors[color]} border-slate-100 flex items-start justify-between`}>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-400 mt-2">{subValue}</p>
      </div>
      <div className="text-2xl opacity-40">{icon}</div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-black uppercase tracking-tighter mb-2">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`${color} h-full transition-all duration-1000 ease-out shadow-inner`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
