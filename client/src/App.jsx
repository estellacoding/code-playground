import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Playground from './pages/Playground';
import SharedPlayground from './pages/SharedPlayground';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/playground/:id?" element={<Playground />} />
            <Route path="/share/:token" element={<SharedPlayground />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;