import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/hero/HeroSection';
import PromptInput from './components/prompt/PromptInput';
import LoadingGame from './components/loading/LoadingGame';
import ResultsPage from './pages/ResultsPage';
import AnalyzePage from './pages/AnalyzePage';
import useArchitecture from './hooks/useArchitecture';

// Home page combining hero + prompt
const HomePage = ({ onSubmit }) => {
  return (
    <div>
      <HeroSection />
      <PromptInput onSubmit={onSubmit} />
    </div>
  );
};

function App() {
  const { isLoading, progress, results, error, generateArchitecture, reset } = useArchitecture();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'loading' | 'results'

  const handleSubmit = (formData) => {
    window.scrollTo(0, 0);
    setCurrentView('loading');
    generateArchitecture(formData);
  };

  // Transition to results when loading completes
  // Scroll to top and transition to results when loading completes
  React.useEffect(() => {
    if (!isLoading && results && currentView === 'loading') {
      window.scrollTo(0, 0);
      setCurrentView('results');
    }
  }, [isLoading, results, currentView]);

  React.useEffect(() => {
    if (!isLoading && error && currentView === 'loading') {
      alert(`Failed to generate architecture: ${error}`);
      setCurrentView('home');
    }
  }, [isLoading, error, currentView]);

  const handleRefine = () => {
    window.scrollTo(0, 0);
    reset();
    setCurrentView('home');
  };

  return (
    <Router>
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="w-full pt-16">
          <Routes>
            <Route
              path="/"
              element={
                currentView === 'loading' ? (
                  <LoadingGame progress={progress} />
                ) : currentView === 'results' ? (
                  <ResultsPage results={results} onRefine={handleRefine} />
                ) : (
                  <HomePage onSubmit={handleSubmit} />
                )
              }
            />
            <Route path="/analyze" element={<AnalyzePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
