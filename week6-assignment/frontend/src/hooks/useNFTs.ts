import { useContext } from 'react';
import { NFTContext } from '../contexts/NFTContext';

export const useNFTs = () => {
  const context = useContext(NFTContext);
  
  if (context === undefined) {
    throw new Error('useNFTs must be used within an NFTProvider');
  }
  
  return context;
};