import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const radice = document.getElementById('root');
if (!radice) {
  throw new Error('Elemento #root non trovato.');
}

ReactDOM.createRoot(radice).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
