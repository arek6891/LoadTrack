import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
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

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Prosty sposób na odzyskanie danych użytkownika z tokena (lub można dodać endpoint /me)
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
    <Router>
      <div className="min-h-screen bg-gray-100 w-full">
        <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center text-center">
          <div className="flex items-center space-x-4">
            <Link to="/menu" className="text-xl font-bold">LoadTrack</Link>
            <div className="hidden md:block text-xs bg-blue-700 px-2 py-1 rounded">
              {user?.username} ({user?.role})
            </div>
          </div>
          <nav className="flex space-x-2 md:space-x-4 overflow-x-auto">
            <Link to="/" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Dashboard</Link>
            <Link to="/scanner" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Skaner</Link>
            <Link to="/pallets" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Palety</Link>
            <Link to="/move" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Ruchy</Link>
            <Link to="/loading" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Załadunek</Link>
            <Link to="/history" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Historia</Link>
            <Link to="/report" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Raport Stanu</Link>
            <Link to="/search" className="text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-2 md:px-3 py-1 rounded">Szukaj</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-xs md:text-sm bg-purple-700 hover:bg-purple-800 px-2 md:px-3 py-1 rounded font-bold">Admin</Link>
            )}
            <button onClick={handleLogout} className="text-xs md:text-sm bg-red-500 hover:bg-red-600 px-2 md:px-3 py-1 rounded">Wyloguj</button>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/menu" element={<Home role={user?.role} />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/pallets" element={<PalletBuilder />} />
            <Route path="/move" element={<StockMovement />} />
            <Route path="/loading" element={<LoadingManager />} />
            <Route path="/history" element={<LoadingHistory />} />
            <Route path="/report" element={<InventoryReport />} />
            <Route path="/search" element={<Search userRole={user?.role} />} />
            <Route path="/locations" element={<Locations />} />
            {user?.role === 'ADMIN' && <Route path="/admin" element={<AdminPanel />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Witaj w LoadTrack</h2>

      <p className="text-gray-600 text-center max-w-md">
        System do skanowania paczek i zarządzania paletami.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
        <Link to="/scanner" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Skaner Paczek</h3>
          <p className="text-sm text-gray-500">Przyjmij nowe paczki.</p>
        </Link>
        <Link to="/pallets" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Budowanie Palet</h3>
          <p className="text-sm text-gray-500">Agreguj paczki.</p>
        </Link>
        <Link to="/move" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Ruchy Magazynowe</h3>
          <p className="text-sm text-gray-500">Zmień lokalizację palety.</p>
        </Link>
        <Link to="/loading" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Załadunek (Wydanie)</h3>
          <p className="text-sm text-gray-500">Wydaj palety z magazynu.</p>
        </Link>
        <Link to="/search" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center border-blue-200 bg-blue-50">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Szukaj</h3>
          <p className="text-sm text-gray-500 font-medium">Znajdź paczkę lub paletę.</p>
        </Link>
        <Link to="/locations" className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors text-center">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Lokalizacje</h3>
          <p className="text-sm text-gray-500">Struktura magazynu.</p>
        </Link>
        {role === 'ADMIN' && (
          <Link to="/admin" className="p-6 bg-white rounded-lg shadow-sm border border-purple-200 hover:border-purple-500 transition-colors text-center bg-purple-50">
            <h3 className="font-bold text-lg mb-2 text-purple-600">Panel Admina</h3>
            <p className="text-sm text-gray-500 font-medium">Zarządzaj użytkownikami.</p>
          </Link>
        )}
      </div>
    </div>
  );
}

export default App;
