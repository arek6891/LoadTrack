import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface LogEntry {
  type: 'stdout' | 'stderr' | 'exit';
  message?: string;
  code?: number;
}

const Diagnostics: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const runTest = (type: 'api' | 'e2e') => {
    if (isRunning) return;
    
    setLogs([]);
    setIsRunning(true);
    
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(
      `http://localhost:3601/api/diagnostics/stream-tests?type=${type}&token=${token}`
    );

    // EventSource doesn't support headers easily, so we pass token in query
    // NOTE: Backend diagnostics.controller needs to support token from query if middleware allows
    
    eventSource.onmessage = (event) => {
      const data: LogEntry = JSON.parse(event.data);
      if (data.type === 'exit') {
        setIsRunning(false);
        eventSource.close();
        if (data.code === 0) {
          toast.success('Testy zakończone sukcesem!');
        } else {
          toast.error(`Testy zakończone błędem (kod: ${data.code})`);
        }
      }
      setLogs((prev) => [...prev, data]);
    };

    eventSource.onerror = () => {
      setIsRunning(false);
      eventSource.close();
      toast.error('Błąd połączenia ze strumieniem testów');
    };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel Diagnostyczny</h1>
        <div className="space-x-4">
          <button
            onClick={() => runTest('api')}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
              isRunning ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Uruchom Testy API
          </button>
          <button
            onClick={() => runTest('e2e')}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
              isRunning ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Uruchom Testy E2E (UI)
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-4 h-[600px] overflow-y-auto font-mono text-sm shadow-2xl border border-gray-700">
        {logs.length === 0 && !isRunning && (
          <div className="text-gray-500 italic">Oczekiwanie na uruchomienie testów...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className={`mb-1 ${
            log.type === 'stderr' ? 'text-red-400' : 
            log.type === 'exit' ? 'text-yellow-400 font-bold' : 'text-green-400'
          }`}>
            {log.type === 'exit' ? `[PROCESS EXIT] Code: ${log.code}` : log.message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Testy API</h3>
          <p className="text-gray-600 text-sm">Szybka weryfikacja logiki biznesowej, uprawnień i bazy danych. Czas: ~5-10s.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold text-lg mb-2 text-purple-600">Testy E2E</h3>
          <p className="text-gray-600 text-sm">Pełna symulacja użytkownika w przeglądarce. Testuje interfejs i integrację. Czas: ~30-60s.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold text-lg mb-2 text-yellow-600">Status Systemu</h3>
          <p className="text-gray-600 text-sm">Logi w czasie rzeczywistym bezpośrednio z runnera testów na serwerze.</p>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
