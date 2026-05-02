import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      onLogin(response.data.user, response.data.token);
      toast.success(`Witaj, ${response.data.user.username}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-black text-center text-blue-600 mb-8">LoadTrack Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase">Użytkownik</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase">Hasło</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-black hover:bg-blue-700 transition-colors"
          >
            {loading ? 'LOGOWANIE...' : 'ZALOGUJ SIĘ'}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
          System WMS v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
