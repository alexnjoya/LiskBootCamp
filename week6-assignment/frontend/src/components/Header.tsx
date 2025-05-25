import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { formatAddress, isLiskTestnet } from '../services/web3Service';

const Header = () => {
  const location = useLocation();
  const { connect, disconnect, isConnected, isConnecting, account, chainId } = useWeb3();
  const { formattedBalance } = useTokenBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCorrectNetwork = chainId ? isLiskTestnet(chainId) : false;

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Mint NFT', path: '/mint' },
    { name: 'My NFTs', path: '/my-nfts' },
    { name: 'Token Info', path: '/token-info' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            NFT Creator
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-500'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full transform origin-left scale-x-100 transition-transform duration-200" />
                )}
              </Link>
            ))}
          </nav>

          {/* Connect Wallet Button (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected && (
              <div className="flex items-center space-x-4">
                {isCorrectNetwork ? (
                  <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-100 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Lisk Testnet
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full border border-red-100 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Wrong Network
                  </span>
                )}
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-600">
                      Balance: <span className="font-semibold text-indigo-600">{formattedBalance} CREATE</span>
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-mono">
                      {formatAddress(account || '')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5
                ${isConnected 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }
                ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isConnecting
                ? 'Connecting...'
                : isConnected
                ? 'Disconnect'
                : 'Connect Wallet'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-indigo-500 focus:outline-none transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <nav className="flex flex-col space-y-4 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg'
                      : 'text-gray-600 hover:text-indigo-500 hover:bg-gray-50 px-4 py-2 rounded-lg'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {isConnected && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  {isCorrectNetwork ? (
                    <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-100 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Lisk Testnet
                    </span>
                  ) : (
                    <span className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full border border-red-100 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      Wrong Network
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">
                    Balance: <span className="font-semibold text-indigo-600">{formattedBalance} CREATE</span>
                  </div>
                  <div className="text-sm text-gray-600 font-mono">
                    {formatAddress(account || '')}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`
                w-full px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isConnected 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                }
                ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isConnecting
                ? 'Connecting...'
                : isConnected
                ? 'Disconnect'
                : 'Connect Wallet'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;