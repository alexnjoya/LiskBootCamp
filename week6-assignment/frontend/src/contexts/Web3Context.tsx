import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import type { ContractInstances, TransactionStatus } from '../types/contracts';
import CreatorTokenABI from '../abis/CreatorToken.json';
import ArtNFTABI from '../abis/ArtNFT.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  contracts: ContractInstances;
  tokenBalance: string;
  creatorRewardAmount: string;
  transactions: Record<string, TransactionStatus>;
  updateTransaction: (hash: string, status: TransactionStatus['status'], message?: string) => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contracts, setContracts] = useState<ContractInstances>({
    creatorToken: null,
    artNFT: null,
  });
  const [tokenBalance, setTokenBalance] = useState('0');
  const [creatorRewardAmount, setCreatorRewardAmount] = useState('0');
  const [transactions, setTransactions] = useState<Record<string, TransactionStatus>>({});

  // Initialize contracts
  useEffect(() => {
    if (signer && isConnected) {
      const creatorTokenAddress = import.meta.env.VITE_CREATOR_TOKEN_ADDRESS;
      const artNFTAddress = import.meta.env.VITE_ART_NFT_ADDRESS;

      if (!creatorTokenAddress || !artNFTAddress) {
        console.error('Contract addresses not found in environment variables');
        return;
      }

      const creatorToken = new ethers.Contract(creatorTokenAddress, (CreatorTokenABI as any).abi, signer);
      const artNFT = new ethers.Contract(artNFTAddress, (ArtNFTABI as any).abi, signer);

      setContracts({
        creatorToken,
        artNFT,
      });
    }
  }, [signer, isConnected]);

  // Fetch token balance and creator reward amount
  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && account && contracts.creatorToken && contracts.artNFT) {
        try {
          const balance = await contracts.creatorToken.balanceOf(account);
          setTokenBalance(ethers.formatEther(balance));

          const rewardAmount = await contracts.artNFT.creatorRewardAmount();
          setCreatorRewardAmount(ethers.formatEther(rewardAmount));
        } catch (error) {
          console.error('Error fetching token data:', error);
        }
      }
    };

    fetchData();
  }, [isConnected, account, contracts]);

  const connect = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        
        // Create ethers provider
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);

        // Connect to the wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersSigner = await ethersProvider.getSigner();
        const connectedChainId = await ethersProvider.getNetwork().then(network => Number(network.chainId));
        
        setSigner(ethersSigner);
        setAccount(accounts[0]);
        setChainId(connectedChainId);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');

        // Setup event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet extension');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    // Refresh the page to ensure all contracts are updated
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const updateTransaction = (
    hash: string, 
    status: TransactionStatus['status'], 
    message?: string
  ) => {
    setTransactions(prev => ({
      ...prev,
      [hash]: {
        hash,
        status,
        message
      }
    }));
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        contracts,
        tokenBalance,
        creatorRewardAmount,
        transactions,
        updateTransaction,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};