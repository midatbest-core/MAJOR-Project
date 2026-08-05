import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import TextStudio from './pages/TextStudio';
import CaptionStudio from './pages/CaptionStudio';
import CreatorIntelligence from './pages/CreatorIntelligence';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-dark-900 text-slate-100">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/text-studio" element={<TextStudio />} />
              <Route path="/caption-studio" element={<CaptionStudio />} />
              <Route path="/creator-intelligence" element={<CreatorIntelligence />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
