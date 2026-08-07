import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import TextStudio from './pages/TextStudio';
import CaptionStudio from './pages/CaptionStudio';
import CreatorIntelligence from './pages/CreatorIntelligence';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="text-studio" element={<TextStudio />} />
            <Route path="caption-studio" element={<CaptionStudio />} />
            <Route path="captions" element={<CaptionStudio />} />
            <Route path="creator-intelligence" element={<CreatorIntelligence />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
