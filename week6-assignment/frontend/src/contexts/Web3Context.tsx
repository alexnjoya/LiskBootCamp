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
  setTokenBalance: (balance: string) => void;
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

  // Initialize provider and check connection
  useEffect(() => {
    const initializeProvider = async () => {
      if (!window.ethereum) return;

      try {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const ethersSigner = await ethersProvider.getSigner();
          const connectedChainId = await ethersProvider.getNetwork().then(network => Number(network.chainId));
          
          setSigner(ethersSigner);
          setAccount(accounts[0]);
          setChainId(connectedChainId);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error initializing provider:', error);
      }
    };

    initializeProvider();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  // Initialize contracts
  useEffect(() => {
    if (!signer || !isConnected || !provider) return;

    const initializeContracts = async () => {
      try {
        const creatorTokenAddress = import.meta.env.VITE_CREATOR_TOKEN_ADDRESS;
        const artNFTAddress = import.meta.env.VITE_ART_NFT_ADDRESS;

        console.log('Initializing contracts with addresses:', {
          creatorToken: creatorTokenAddress,
          artNFT: artNFTAddress
        });

        if (!creatorTokenAddress || !artNFTAddress) {
          console.error('Contract addresses not found in environment variables');
          return;
        }

        // Check if contracts are deployed at the specified addresses
        const [creatorTokenCode, artNFTCode] = await Promise.all([
          provider.getCode(creatorTokenAddress),
          provider.getCode(artNFTAddress)
        ]);

        console.log('Contract code check results:', {
          creatorToken: creatorTokenCode ? 'Found' : 'Not found',
          artNFT: artNFTCode ? 'Found' : 'Not found'
        });

        if (!creatorTokenCode || creatorTokenCode === '0x') {
          console.error('CreatorToken contract not deployed at the specified address:', creatorTokenAddress);
          return;
        }

        if (!artNFTCode || artNFTCode === '0x') {
          console.error('ArtNFT contract not deployed at the specified address:', artNFTAddress);
          return;
        }

        const creatorToken = new ethers.Contract(creatorTokenAddress, (CreatorTokenABI as any).abi, signer);
        const artNFT = new ethers.Contract(artNFTAddress, (ArtNFTABI as any).abi, signer);

        // Verify contract interfaces - only check balanceOf as it's a standard ERC20 function
        try {
          await creatorToken.balanceOf(ethers.ZeroAddress);
          console.log('CreatorToken contract interface verified successfully');
        } catch (error) {
          console.error('Error verifying CreatorToken interface:', error);
          return;
        }

        // Set contracts only if both are valid
        setContracts({
          creatorToken,
          artNFT,
        });

        console.log('Contracts initialized successfully');
      } catch (error) {
        console.error('Error initializing contracts:', error);
        setContracts({
          creatorToken: null,
          artNFT: null,
        });
      }
    };

    initializeContracts();
  }, [signer, isConnected, provider]);

  // Fetch token data
  useEffect(() => {
    if (!isConnected || !account || !contracts.creatorToken || !contracts.artNFT || !provider) return;

    const fetchTokenData = async () => {
      try {
        const creatorToken = contracts.creatorToken;
        const artNFT = contracts.artNFT;

        if (!creatorToken || !artNFT) return;

        // Verify contracts are still valid
        const [creatorTokenCode, artNFTCode] = await Promise.all([
          provider.getCode(await creatorToken.getAddress()),
          provider.getCode(await artNFT.getAddress())
        ]);

        if (!creatorTokenCode || creatorTokenCode === '0x' || !artNFTCode || artNFTCode === '0x') {
          console.error('Contracts no longer valid at their addresses');
          setTokenBalance('0');
          setCreatorRewardAmount('0');
          return;
        }

        const [balance, rewardAmount] = await Promise.all([
          creatorToken.balanceOf(account),
          artNFT.creatorRewardAmount()
        ]);

        setTokenBalance(ethers.formatEther(balance));
        setCreatorRewardAmount(ethers.formatEther(rewardAmount));
      } catch (error) {
        console.error('Error fetching token data:', error);
        setTokenBalance('0');
        setCreatorRewardAmount('0');
      }
    };

    fetchTokenData();
  }, [isConnected, account, contracts.creatorToken, contracts.artNFT, provider]);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet extension');
      return;
    }

    try {
      setIsConnecting(true);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      const connectedChainId = await ethersProvider.getNetwork().then(network => Number(network.chainId));
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(accounts[0]);
      setChainId(connectedChainId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setTokenBalance('0');
    setCreatorRewardAmount('0');
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
        setTokenBalance,
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