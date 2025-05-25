import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';
import type { Web3ContextType } from '../contexts/Web3Context';

export const useTokenBalance = () => {
  const web3 = useWeb3() as Web3ContextType;
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (web3.isConnected && web3.account && web3.contracts.creatorToken) {
      fetchBalance();
    } else {
      setBalance('0');
      setFormattedBalance('0.00');
    }
  }, [web3.isConnected, web3.account, web3.contracts]);

  const fetchBalance = async () => {
    if (!web3.isConnected || !web3.account || !web3.contracts.creatorToken) return;

    try {
      setIsLoading(true);
      const balanceResult = await web3.contracts.creatorToken.balanceOf(web3.account);
      setBalance(balanceResult.toString());
      
      // Format the balance with 2 decimal places
      const formatted = ethers.formatEther(balanceResult);
      setFormattedBalance(Number(formatted).toFixed(2));
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    formattedBalance,
    isLoading,
    refreshBalance: fetchBalance
  };
};