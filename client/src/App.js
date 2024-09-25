

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Ensure paths are correct
import Dashboard from './pages/Dashboard';


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route to main dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        
        
        {/* Fallback route for unmatched paths */}
        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;