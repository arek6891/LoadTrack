import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MassImport() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'PACKAGE' | 'PALLET'>('PACKAGE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ importedCount: number; skippedCount: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Wybierz plik');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    setLoading(true);
    try {
      const response = await axios.post('/api/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      toast.success('Import zakończony');
      setFile(null);
      // Reset input file
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Błąd importu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📂</span> Import Masowy (Excel/CSV)
        </h2>
        
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ Danych</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={type === 'PACKAGE'} 
                  onChange={() => setType('PACKAGE')} 
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Paczki</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={type === 'PALLET'} 
                  onChange={() => setType('PALLET')} 
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Palety</span>
              </label>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
            <input 
              id="file-upload"
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <div className="text-3xl">📄</div>
              <p className="text-sm font-medium text-gray-600">
                {file ? file.name : 'Kliknij lub przeciągnij plik tutaj'}
              </p>
              <p className="text-xs text-gray-400">Obsługiwane formaty: .xlsx, .xls, .csv</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800">
            <p className="font-bold mb-1">Wskazówki:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>Plik powinien zawierać kolumnę o nazwie <strong>trackingNumber</strong> (dla paczek) lub <strong>palletNumber</strong> (dla palet).</li>
              <li>Możesz również użyć nazwy kolumny <strong>number</strong>.</li>
              <li>Duplikaty zostaną automatycznie pominięte.</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-black shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            {loading ? 'PRZETWARZANIE...' : 'ROZPOCZNIJ IMPORT'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg animate-fade-in">
          <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
            <span className="mr-2">✅</span> Wynik Importu
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm border border-green-100">
              <p className="text-xs text-green-600 uppercase font-bold tracking-widest">Zaimportowano</p>
              <p className="text-3xl font-black text-green-800">{result.importedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-orange-100">
              <p className="text-xs text-orange-600 uppercase font-bold tracking-widest">Pominięto/Błędy</p>
              <p className="text-3xl font-black text-orange-800">{result.skippedCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
