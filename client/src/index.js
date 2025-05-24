// client/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import ServerPage from './pages/serverPage.js';
import ClientPage from './pages/clientPage.js';
import Test from './pages/test.js';
import './App.css';

const container = document.getElementById('root');

// 2. Create a root
const root = createRoot(container);

root.render(
      <App>
      </App>
);