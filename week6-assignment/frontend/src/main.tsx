import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { Web3Provider } from './contexts/Web3Context';
import { NFTProvider } from './contexts/NFTContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <NFTProvider>
          <App />
          <Toaster position="top-right" />
        </NFTProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>
);