import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { isLiskTestnet, switchToLiskTestnet } from '../services/web3Service';
import { LISK_TESTNET_NAME } from '../utils/constants';


interface ConnectWalletProps {
  message?: string;
  className?: string;
}

const ConnectWallet = ({ 
  message = 'Connect your wallet to access this feature', 
  className = '' 
}: ConnectWalletProps) => {
  const { connect, isConnected, isConnecting, chainId } = useWeb3();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToLiskTestnet();
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // Check if connected to the correct network
  const isCorrectNetwork = chainId ? isLiskTestnet(chainId) : false;

  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl ${className}`}>
      <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
        />
      </svg>
      
      <p className="text-gray-600 text-center mb-6">{message}</p>
      
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`
            px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors
            ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : !isCorrectNetwork ? (
        <div className="flex flex-col items-center">
          <div className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full mb-4">
            Wrong Network
          </div>
          <button
            onClick={handleSwitchNetwork}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
          >
            Switch to {LISK_TESTNET_NAME}
          </button>
        </div>
      ) : (
        <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
          Connected to {LISK_TESTNET_NAME}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;