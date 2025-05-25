import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Mint from './pages/Mint';
import MyNFTs from './pages/MyNFTs';
import TokenInfo from './pages/TokenInfo';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/my-nfts" element={<MyNFTs />} />
          <Route path="/token-info" element={<TokenInfo />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;