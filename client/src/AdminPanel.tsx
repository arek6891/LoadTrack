import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('OPERATOR');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Błąd podczas pobierania użytkowników');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', {
        username: newUsername,
        password: newPassword,
        role: newRole
      });
      setNewUsername('');
      setNewPassword('');
      setNewRole('OPERATOR');
      fetchUsers();
      alert('Użytkownik dodany pomyślnie');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Błąd podczas dodawania użytkownika');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Błąd podczas usuwania użytkownika');
    }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      await axios.patch(`/api/users/${id}`, { role });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Błąd podczas zmiany roli');
    }
  };

  if (loading) return <div className="text-center p-10">Ładowanie...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Panel Administratora</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Dodaj Nowego Użytkownika</h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            className="p-2 border rounded"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            className="p-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <select
            className="p-2 border rounded"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="OPERATOR">OPERATOR</option>
            <option value="LEADER">LEADER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold"
          >
            Dodaj
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Użytkownik</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Rola</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Data utworzenia</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">
                  <select
                    className="p-1 border rounded text-sm"
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  >
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="LEADER">LEADER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
