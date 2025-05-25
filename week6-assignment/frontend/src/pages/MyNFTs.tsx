import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useNFTs } from '../hooks/useNFTs';
import ConnectWallet from '../components/ConnectWallet';
import Gallery from '../components/Gallery';
import { isLiskTestnet } from '../services/web3Service';

const MyNFTs = () => {
  const { isConnected, chainId } = useWeb3();
  const { myNFTs, myCreatedNFTs, loadingNFTs, refreshNFTs } = useNFTs();
  const [activeTab, setActiveTab] = useState<'owned' | 'created'>('owned');
  
  // Check if connected to the correct network
  const isCorrectNetwork = chainId ? isLiskTestnet(chainId) : false;
  
  // Refresh NFTs when page loads
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshNFTs();
    }
  }, [isConnected, isCorrectNetwork, refreshNFTs]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My NFT Collection</h1>
      
      {isConnected && isCorrectNetwork ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('owned')}
              className={`py-3 px-6 font-medium ${
                activeTab === 'owned'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              NFTs I Own ({myNFTs.length})
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`py-3 px-6 font-medium ${
                activeTab === 'created'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              NFTs I Created ({myCreatedNFTs.length})
            </button>
          </div>
          
          {/* NFT Gallery */}
          {activeTab === 'owned' ? (
            <>
              <Gallery
                nfts={myNFTs}
                isLoading={loadingNFTs}
                emptyMessage="You don't own any NFTs yet."
                title="NFTs I Own"
                showOwner={false}
              />
              
              {!loadingNFTs && myNFTs.length === 0 && (
                <div className="mt-8 text-center">
                  <Link
                    to="/mint"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                  >
                    Mint Your First NFT
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <Gallery
                nfts={myCreatedNFTs}
                isLoading={loadingNFTs}
                emptyMessage="You haven't created any NFTs yet."
                title="NFTs I Created"
                showCreator={false}
              />
              
              {!loadingNFTs && myCreatedNFTs.length === 0 && (
                <div className="mt-8 text-center">
                  <Link
                    to="/mint"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                  >
                    Create Your First NFT
                  </Link>
                </div>
              )}
            </>
          )}
          
          {/* Refresh Button */}
          {!loadingNFTs && (myNFTs.length > 0 || myCreatedNFTs.length > 0) && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={refreshNFTs}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Refresh NFTs
              </button>
            </div>
          )}
        </>
      ) : (
        <ConnectWallet message="Connect your wallet to view your NFT collection" />
      )}
    </div>
  );
};

export default MyNFTs;