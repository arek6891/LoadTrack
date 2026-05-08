import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Scanner from './Scanner';
import Locations from './Locations';
import PalletBuilder from './PalletBuilder';
import StockMovement from './StockMovement';
import LoadingManager from './LoadingManager';
import Search from './Search';
import Login from './Login';
import AdminPanel from './AdminPanel';
import Dashboard from './Dashboard';
import LoadingHistory from './LoadingHistory';
import InventoryReport from './InventoryReport';
import Diagnostics from './Diagnostics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="min-h-screen bg-gray-100 w-full flex flex-col pb-20 md:pb-0">
          <header className="bg-slate-900 text-white shadow-lg hidden md:flex justify-between items-center p-4 sticky top-0 z-50">
            <Link to="/" className="text-xl font-black tracking-tighter flex items-center">
              <span className="bg-blue-600 p-1 rounded mr-2">LT</span> LOADTRACK
            </Link>
            <nav className="flex items-center space-x-2">
              <NavLink to="/" label="Pulpit" />
              <NavLink to="/scanner" label="SKANER" primary />
              <NavLink to="/pallets" label="Palety" />
              <NavLink to="/move" label="Ruchy" />
              <NavLink to="/loading" label="Załadunek" />
              <NavLink to="/search" label="Szukaj" />
              {user?.role === 'ADMIN' && <NavLink to="/diagnostics" label="Testy" highlight />}
              {user?.role === 'ADMIN' && <NavLink to="/admin" label="Admin" highlight />}
              <button onClick={handleLogout} className="ml-4 p-2 text-gray-400 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </nav>
          </header>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <MobileTab to="/scanner" label="Skanuj" icon="🔍" />
            <MobileTab to="/pallets" label="Palety" icon="📦" />
            <MobileTab to="/" label="Home" icon="🏠" />
            <MobileTab to="/move" label="Ruchy" icon="🔄" />
            <MobileTab to="/loading" label="Wydaj" icon="🚚" />
          </nav>

          <main className="flex-grow p-2 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/pallets" element={<PalletBuilder />} />
              <Route path="/move" element={<StockMovement />} />
              <Route path="/loading" element={<LoadingManager />} />
              <Route path="/history" element={<LoadingHistory />} />
              <Route path="/report" element={<InventoryReport />} />
              <Route path="/search" element={<Search userRole={user?.role} />} />
              <Route path="/locations" element={<Locations />} />
              {user?.role === 'ADMIN' && <Route path="/admin" element={<AdminPanel />} />}
              {user?.role === 'ADMIN' && <Route path="/diagnostics" element={<Diagnostics />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function NavLink({ to, label, primary, highlight }: { to: string; label: string; primary?: boolean; highlight?: boolean }) {
  const base = "px-4 py-2 rounded-lg text-sm font-bold transition-all ";
  const styles = primary 
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md scale-105" 
    : highlight 
    ? "bg-purple-600 text-white hover:bg-purple-700" 
    : "text-gray-300 hover:bg-slate-800 hover:text-white";
  
  return <Link to={to} className={base + styles}>{label}</Link>;
}

function MobileTab({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center w-full py-1 text-gray-600 active:text-blue-600">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{label}</span>
    </Link>
  );
}

export default App;
