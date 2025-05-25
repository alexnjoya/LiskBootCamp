import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useTokenBalance } from '../hooks/useTokenBalance';
import ConnectWallet from '../components/ConnectWallet';
import { isLiskTestnet } from '../services/web3Service';
import { CREATOR_TOKEN_ADDRESS, LISK_EXPLORER_URL } from '../utils/constants';
import { ethers } from 'ethers';

const TokenInfo = () => {
  const { isConnected, chainId, contracts } = useWeb3();
  const { formattedBalance, refreshBalance } = useTokenBalance();
  
  // Token info state
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [totalMinted, setTotalMinted] = useState<string>('0');
  const [remainingSupply, setRemainingSupply] = useState<string>('0');
  const [maxSupply, setMaxSupply] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if connected to the correct network
  const isCorrectNetwork = chainId ? isLiskTestnet(chainId) : false;
  
  // Fetch token info
  const fetchTokenInfo = async () => {
    if (!isConnected || !isCorrectNetwork || !contracts.creatorToken) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token info from contract
      const [
        totalSupplyResult,
        totalMintedResult,
        remainingSupplyResult,
        maxSupplyResult
      ] = await Promise.all([
        contracts.creatorToken.totalSupply(),
        contracts.creatorToken.totalMinted(),
        contracts.creatorToken.remainingSupply(),
        contracts.creatorToken.MAX_SUPPLY()
      ]);
      
      // Format values
      setTotalSupply(formatTokenAmount(totalSupplyResult));
      setTotalMinted(formatTokenAmount(totalMintedResult));
      setRemainingSupply(formatTokenAmount(remainingSupplyResult));
      setMaxSupply(formatTokenAmount(maxSupplyResult));
    } catch (error) {
      console.error('Error fetching token info:', error);
      setError('Failed to load token information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch token info when page loads or when connection changes
  useEffect(() => {
    fetchTokenInfo();
    refreshBalance();
  }, [isConnected, isCorrectNetwork, contracts.creatorToken]);
  
  // Format token amount (convert from wei to token units)
  const formatTokenAmount = (amount: bigint): string => {
    try {
      const formattedAmount = ethers.formatEther(amount.toString());
      return parseFloat(formattedAmount).toLocaleString(undefined, {
        maximumFractionDigits: 0
      });
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '0';
    }
  };
  
  // Calculate percentage of total supply minted
  const calculatePercentage = (): number => {
    if (maxSupply === '0') return 0;
    
    try {
      const totalMintedValue = parseFloat(totalMinted.replace(/,/g, ''));
      const maxSupplyValue = parseFloat(maxSupply.replace(/,/g, ''));
      return (totalMintedValue / maxSupplyValue) * 100;
    } catch (error) {
      console.error('Error calculating percentage:', error);
      return 0;
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    await fetchTokenInfo();
    await refreshBalance();
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Creator Token Info</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {isConnected && isCorrectNetwork ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">CreatorToken (CREATE)</h2>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                  <p className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                  <p className="mt-4 text-gray-600">Loading token information...</p>
                </div>
              ) : (
                <>
                  {/* Token Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-gray-500 text-sm mb-1">Total Supply</h3>
                      <p className="text-2xl font-semibold text-gray-800">{totalSupply} CREATE</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-gray-500 text-sm mb-1">Max Supply</h3>
                      <p className="text-2xl font-semibold text-gray-800">{maxSupply} CREATE</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-gray-500 text-sm mb-1">Total Minted</h3>
                      <p className="text-2xl font-semibold text-gray-800">{totalMinted} CREATE</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-gray-500 text-sm mb-1">Remaining Supply</h3>
                      <p className="text-2xl font-semibold text-gray-800">{remainingSupply} CREATE</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-700 font-medium">Minting Progress</h3>
                      <span className="text-gray-500 text-sm">{calculatePercentage().toFixed(2)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${calculatePercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {totalMinted} of {maxSupply} tokens minted
                    </p>
                  </div>
                  
                  {/* Your Balance */}
                  <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                    <h3 className="text-indigo-800 font-medium mb-4">Your Token Balance</h3>
                    <div className="flex items-center">
                      <div className="bg-indigo-100 rounded-full p-3 mr-4">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-indigo-800">{formattedBalance} CREATE</p>
                        <p className="text-indigo-600 text-sm mt-1">Earned from minting NFTs</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <Link
                        to="/mint"
                        className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Mint NFTs to Earn More
                      </Link>
                    </div>
                  </div>
                  
                  {/* Contract Info */}
                  <div>
                    <h3 className="text-gray-700 font-medium mb-4">Contract Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <span className="text-gray-500 mb-1 md:mb-0">Token Contract:</span>
                        <a
                          href={`${LISK_EXPLORER_URL}/address/${CREATOR_TOKEN_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline break-all"
                        >
                          {CREATOR_TOKEN_ADDRESS}
                        </a>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <span className="text-gray-500 mb-1 md:mb-0">Network:</span>
                        <span className="text-gray-800">Lisk Testnet</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <span className="text-gray-500 mb-1 md:mb-0">Token Standard:</span>
                        <span className="text-gray-800">ERC-20</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <span className="text-gray-500 mb-1 md:mb-0">Decimals:</span>
                        <span className="text-gray-800">18</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {!isLoading && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className={`
                      flex items-center px-4 py-2 rounded-lg transition-colors mx-auto
                      ${isLoading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-gray-500 rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                        Refresh Token Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ConnectWallet message="Connect your wallet to view token information" />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Token Info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About Creator Tokens</h2>
            <p className="text-gray-600 mb-4">
              Creator Tokens (CREATE) are ERC-20 tokens that reward NFT creators on our platform.
            </p>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Automatically minted when you create an NFT</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Fixed supply with incremental minting</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Fully compatible with ERC-20 standard</span>
              </li>
            </ul>
            <Link
              to="/mint"
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              Mint an NFT to earn tokens
              <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Future Use Cases */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Future Use Cases</h2>
            <p className="text-gray-600 mb-4">
              Creator Tokens will enable additional features and benefits in the future:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Governance voting on platform decisions</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access to premium features and exclusive NFT drops</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Staking rewards and passive income opportunities</span>
              </li>
              <li className="flex">
                <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Trading in decentralized exchanges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;