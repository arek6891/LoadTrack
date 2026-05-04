import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  type: 'PACKAGE' | 'PALLET';
  htmlContent: string;
  cssContent: string;
  isDefault: boolean;
  updatedAt: string;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/label-templates');
      setTemplates(response.data);
    } catch (err) {
      toast.error('Błąd pobierania szablonów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      if (editingTemplate.id) {
        await axios.patch(`/api/label-templates/${editingTemplate.id}`, editingTemplate);
        toast.success('Szablon zaktualizowany');
      } else {
        await axios.post('/api/label-templates', editingTemplate);
        toast.success('Szablon utworzony');
      }
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd zapisu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten szablon?')) return;
    try {
      await axios.delete(`/api/label-templates/${id}`);
      toast.success('Szablon usunięty');
      fetchTemplates();
    } catch (err) {
      toast.error('Błąd usuwania');
    }
  };

  if (loading) return <div>Ładowanie szablonów...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Szablony Etykiet</h2>
        {!editingTemplate && (
          <button 
            onClick={() => setEditingTemplate({ type: 'PACKAGE', htmlContent: '', cssContent: '', isDefault: false })}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
          >
            + Nowy Szablon
          </button>
        )}
      </div>

      {editingTemplate ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-bold mb-4">{editingTemplate.id ? 'Edytuj Szablon' : 'Nowy Szablon'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Nazwa</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded mt-1" 
                  value={editingTemplate.name || ''}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Typ</label>
                <select 
                  className="w-full border p-2 rounded mt-1"
                  value={editingTemplate.type}
                  onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value as any})}
                >
                  <option value="PACKAGE">Paczka</option>
                  <option value="PALLET">Paleta</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium">HTML (Placeholdery: {'{{number}}'})</label>
              <textarea 
                className="w-full border p-2 rounded mt-1 font-mono text-sm h-32"
                value={editingTemplate.htmlContent || ''}
                onChange={e => setEditingTemplate({...editingTemplate, htmlContent: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">CSS</label>
              <textarea 
                className="w-full border p-2 rounded mt-1 font-mono text-sm h-32"
                value={editingTemplate.cssContent || ''}
                onChange={e => setEditingTemplate({...editingTemplate, cssContent: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isDefault"
                checked={editingTemplate.isDefault || false}
                onChange={e => setEditingTemplate({...editingTemplate, isDefault: e.target.checked})}
              />
              <label htmlFor="isDefault" className="text-sm">Ustaw jako domyślny dla tego typu</label>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setEditingTemplate(null)}
                className="bg-gray-200 px-4 py-2 rounded font-bold"
              >
                Anuluj
              </button>
              <button 
                type="submit" 
                className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
              >
                Zapisz
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <p className="text-center text-gray-500 py-10 bg-white rounded border">Brak szablonów.</p>
          ) : (
            templates.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{t.name}</p>
                    {t.isDefault && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Domyślny</span>}
                  </div>
                  <p className="text-xs text-gray-500 uppercase">{t.type} | Aktualizacja: {new Date(t.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditingTemplate(t)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edytuj
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
