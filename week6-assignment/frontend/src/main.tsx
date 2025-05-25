import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { Web3Provider } from './contexts/Web3Context';
import { NFTProvider } from './contexts/NFTContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <NFTProvider>
          <App />
          <ToastContainer position="bottom-right" autoClose={5000} />
        </NFTProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>,
);