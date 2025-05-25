import { useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useTokenBalance } from '../hooks/useTokenBalance';
import MintForm from '../components/MintForm';
import ConnectWallet from '../components/ConnectWallet';
import { isLiskTestnet } from '../services/web3Service';

const Mint = () => {
  const { isConnected, chainId, creatorRewardAmount } = useWeb3();
  const { formattedBalance, refreshBalance } = useTokenBalance();
  
  // Check if connected to the correct network
  const isCorrectNetwork = chainId ? isLiskTestnet(chainId) : false;
  
  // Refresh token balance when page loads
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshBalance();
    }
  }, [isConnected, isCorrectNetwork, refreshBalance]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mint a New NFT</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {isConnected && isCorrectNetwork ? (
            <MintForm />
          ) : (
            <ConnectWallet message="Connect your wallet to mint NFTs" />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Reward Info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Creator Rewards</h2>
            <p className="text-gray-600 mb-4">
              Every time you mint an NFT, you'll receive Creator Tokens as a reward.
            </p>
            
            <div className="bg-indigo-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reward per mint:</span>
                <span className="font-semibold text-indigo-600">{creatorRewardAmount} CREATE</span>
              </div>
            </div>
            
            {isConnected && isCorrectNetwork && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your balance:</span>
                  <span className="font-semibold text-gray-800">{formattedBalance} CREATE</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tips */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Minting Tips</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Choose a high-quality image for your NFT to make it stand out.</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add a detailed description to help others understand your creation.</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Include attributes to categorize and add traits to your NFT.</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Make sure you have enough ETH for gas fees on the Lisk testnet.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mint;