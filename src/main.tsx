import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from '@/utils/lib/queryClient';
import '@/utils/lib/i18n';
import { ThemeProvider } from '@contexts/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>,
);
