import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ИСПРАВЛЕНО: Добавили базовый путь для работы в подпапке хостинга */}
    <BrowserRouter basename="/eisk">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);