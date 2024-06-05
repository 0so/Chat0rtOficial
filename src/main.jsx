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
import { createRoot } from 'react-dom/client'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AdminPanel from '../src/components/4dm1n/AdminPanel.jsx';
import './index.css';
import ChatGrupal from "../src/components/chat/ChatGrupo.jsx";
import Video from '../src/components/video/Video.jsx'; 


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<App />} /> 
        <Route path="/admin" element={<AdminPanel />} /> 
        <Route path="/chat-grupal/:userId" element={<ChatGrupal />} /> 
        <Route path="/video" element={<Video />} /> 
      </Routes> 
    </BrowserRouter>
  </React.StrictMode>
);
