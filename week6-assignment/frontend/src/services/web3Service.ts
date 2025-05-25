import { ethers } from 'ethers';

// Lisk testnet chain ID
export const LISK_TESTNET_CHAIN_ID = 578; // Replace with actual Lisk testnet chain ID

// Check if the connected network is Lisk testnet
export const isLiskTestnet = (chainId: number): boolean => {
  return chainId === LISK_TESTNET_CHAIN_ID;
};

// Switch to Lisk testnet
export const switchToLiskTestnet = async (): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${LISK_TESTNET_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // This error code means the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${LISK_TESTNET_CHAIN_ID.toString(16)}`,
              chainName: 'Lisk Testnet',
              nativeCurrency: {
                name: 'Lisk',
                symbol: 'LSK',
                decimals: 18,
              },
              rpcUrls: [import.meta.env.VITE_LISK_RPC_URL],
              blockExplorerUrls: ['https://testnet-explorer.lisk.com/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Lisk testnet to wallet:', addError);
        return false;
      }
    }
    console.error('Error switching to Lisk testnet:', error);
    return false;
  }
};

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format token amount for display
export const formatTokenAmount = (amount: string): string => {
  try {
    // Parse amount as ethers BigNumber
    const value = ethers.formatEther(amount);
    
    // Format with 2 decimal places
    return parseFloat(value).toFixed(2);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0.00';
  }
};