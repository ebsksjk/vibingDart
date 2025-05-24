// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServerPage from './pages//serverPage.js';
import ClientPage from './pages/clientPage.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Server Display - http://localhost:3000/server */}
          <Route path="/server" element={
            <>
              <h1>Dart Counter - Server Display</h1>
              <ServerPage />
            </>
          } />

          {/* Mobile Client - http://localhost:3000/client */}
          <Route path="/client" element={
            <>
              <h1>Dart Counter - Player Input</h1>
              <ClientPage />
            </>
          } />

          {/* Default route - redirects to client */}
          <Route path="/" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Dart Counter App</h1>
              <div style={{ marginTop: '30px' }}>
                <h3>Choose your view:</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                  <a href="/server" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                    Server Display
                  </a>
                  <a href="/client" style={{ padding: '10px 20px', background: '#2196F3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                    Mobile Client
                  </a>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;