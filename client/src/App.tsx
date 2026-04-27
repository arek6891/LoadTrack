import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 w-full">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold">LoadTrack</h1>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Witaj w LoadTrack</h2>
      <p className="text-gray-600 text-center max-w-md">
        System do skanowania paczek i zarządzania paletami.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Skaner (Mobile)</h3>
          <p className="text-sm text-gray-500">Przejdź do trybu skanowania dla magazynu.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Admin Panel</h3>
          <p className="text-sm text-gray-500">Zarządzaj stockiem i raportami.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
