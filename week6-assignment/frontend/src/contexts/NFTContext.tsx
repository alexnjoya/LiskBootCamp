import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import type { NFT } from '../types/nft';
import { toast } from 'sonner';

interface NFTContextType {
  allNFTs: NFT[];
  myNFTs: NFT[];
  myCreatedNFTs: NFT[];
  loadingNFTs: boolean;
  refreshNFTs: () => Promise<void>;
  mintNFT: (tokenURI: string) => Promise<string>;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export { NFTContext };

export const NFTProvider = ({ children }: { children: ReactNode }) => {
  const web3 = useWeb3();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFT[]>([]);
  const [myCreatedNFTs, setMyCreatedNFTs] = useState<NFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

  // Fetch NFTs when connected
  useEffect(() => {
    if (web3.isConnected) {
      refreshNFTs();
    }
  }, [web3.isConnected, web3.account]);

  const refreshNFTs = async () => {
    if (!web3.isConnected || !web3.contracts.artNFT || !web3.account) return;

    try {
      setLoadingNFTs(true);
      
      // Get total supply
      const totalSupply = await web3.contracts.artNFT.totalSupply();
      const totalSupplyNumber = Number(totalSupply);
      
      // Fetch all NFTs
      const fetchedNFTs: NFT[] = [];
      
      for (let i = 0; i < totalSupplyNumber; i++) {
        try {
          const tokenURI = await web3.contracts.artNFT.tokenURI(i);
          const owner = await web3.contracts.artNFT.ownerOf(i);
          const creator = await web3.contracts.artNFT.getCreator(i);
          
          // Fetch metadata
          let metadata;
          try {
            // If IPFS URI, convert to HTTP gateway URL
            const uri = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            const response = await fetch(uri);
            metadata = await response.json();
          } catch (err) {
            console.error(`Error fetching metadata for token ${i}:`, err);
            metadata = {
              name: `NFT #${i}`,
              description: 'Metadata unavailable',
              image: '',
            };
          }
          
          fetchedNFTs.push({
            id: i,
            tokenURI,
            metadata,
            owner,
            creator
          });
        } catch (err) {
          console.error(`Error fetching NFT ${i}:`, err);
        }
      }
      
      setAllNFTs(fetchedNFTs);
      
      // Filter owned and created NFTs
      setMyNFTs(fetchedNFTs.filter(nft => 
        web3.account && nft.owner.toLowerCase() === web3.account.toLowerCase()
      ));
      
      setMyCreatedNFTs(fetchedNFTs.filter(nft => 
        web3.account && nft.creator.toLowerCase() === web3.account.toLowerCase()
      ));
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load NFTs. Please try again later.');
    } finally {
      setLoadingNFTs(false);
    }
  };

  const mintNFT = async (tokenURI: string): Promise<string> => {
    if (!web3.isConnected || !web3.contracts.artNFT) {
      throw new Error('Wallet not connected or contracts not initialized');
    }
    
    try {
      const tx = await web3.contracts.artNFT.mintNFT(tokenURI);
      
      // Update transaction status
      web3.updateTransaction(tx.hash, 'pending', 'Minting NFT...');
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        web3.updateTransaction(tx.hash, 'confirmed', 'NFT minted successfully!');
        await refreshNFTs();
        
        // Parse the NFT minted event to get the token ID
        const mintedEvent = receipt.logs
          .map((log: { topics: string[]; data: string }) => {
            try {
              return web3.contracts.artNFT?.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean)
          .find((event: { name: string; args: { tokenId: string } } | null) => event?.name === 'NFTMinted');
        
        const tokenId = mintedEvent ? Number(mintedEvent.args.tokenId) : -1;
        
        return tokenId.toString();
      } else {
        web3.updateTransaction(tx.hash, 'failed', 'NFT minting failed');
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.');
      throw error;
    }
  };

  return (
    <NFTContext.Provider
      value={{
        allNFTs,
        myNFTs,
        myCreatedNFTs,
        loadingNFTs,
        refreshNFTs,
        mintNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
};