import { useWeb3 } from './useWeb3';
import type { Web3ContextType } from '../contexts/Web3Context';
import { ethers } from 'ethers';

export const useTokenBalance = () => {
  const web3 = useWeb3() as Web3ContextType;

  const refreshBalance = async () => {
    if (!web3.isConnected || !web3.account || !web3.contracts.creatorToken) return;

    try {
      const balanceResult = await web3.contracts.creatorToken.balanceOf(web3.account);
      const formatted = ethers.formatEther(balanceResult);
      web3.setTokenBalance(formatted);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      web3.setTokenBalance('0');
    }
  };

  return {
    balance: web3.tokenBalance,
    formattedBalance: Number(web3.tokenBalance).toFixed(2),
    isLoading: false,
    refreshBalance
  };
};