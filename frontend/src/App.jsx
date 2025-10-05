import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Distributions from './pages/Distributions';
import HypothesisTesting from './pages/HypothesisTesting';
import RegressionAnalysis from './pages/RegressionAnalysis';
import Navbar from './components/Navbar';
import './App.css';

const App = () => {
  return (
    <div className="container">
      <div className="header">
        <h1>Statistical Analysis Tool</h1>
      </div>
      
      <Navbar />

      <div className="grid-layout">
        <Routes>
          <Route path="/" element={<Distributions />} />
          <Route path="/hypothesis" element={<HypothesisTesting />} />
          <Route path="/regression" element={<RegressionAnalysis />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;