import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;