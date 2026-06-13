import { useState } from 'react';
import { DocumentProvider } from './context/DocumentContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <DocumentProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {currentPage === 'landing' && <LandingPage onGetStarted={() => setCurrentPage('dashboard')} />}
        {currentPage === 'dashboard' && <Dashboard />}
      </div>
    </DocumentProvider>
  );
}

export default App;
