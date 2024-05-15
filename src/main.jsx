// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
// main.jsx
// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client'; // Cambia la importación aquí
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AdminPanel from '../src/components/4dm1n/AdminPanel.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes> {/* Utiliza Routes en lugar de Route */}
        <Route path="/" element={<App />} /> {/* Utiliza 'element' para definir el componente */}
        <Route path="/admin" element={<AdminPanel />} /> {/* Utiliza 'element' para definir el componente */}
      </Routes> {/* Cierra Routes */}
    </BrowserRouter>
  </React.StrictMode>
);
