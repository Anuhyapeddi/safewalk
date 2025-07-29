// File: src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import DirectionsPage from './components/DirectionsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/directions" element={<DirectionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;