import { useState, useEffect } from 'react';
import type { NFT } from '../types/nft';
import NFTCard from './NFTCard';

interface GalleryProps {
  nfts: NFT[];
  isLoading: boolean;
  emptyMessage?: string;
  showOwner?: boolean;
  showCreator?: boolean;
  title?: string;
}

const Gallery = ({
  nfts,
  isLoading,
  emptyMessage = 'No NFTs found',
  showOwner = true,
  showCreator = true,
  title
}: GalleryProps) => {
  const [filteredNFTs, setFilteredNFTs] = useState<NFT[]>(nfts);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter NFTs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNFTs(nfts);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = nfts.filter(nft => 
      nft.metadata.name?.toLowerCase().includes(lowerCaseSearch) ||
      nft.metadata.description?.toLowerCase().includes(lowerCaseSearch) ||
      nft.id.toString().includes(lowerCaseSearch)
    );
    
    setFilteredNFTs(filtered);
  }, [nfts, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      {/* Title and search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        {title && <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">{title}</h2>}
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading NFTs...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredNFTs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
          <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-600">{emptyMessage}</p>
        </div>
      )}

      {/* NFT gallery grid */}
      {!isLoading && filteredNFTs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map(nft => (
            <NFTCard 
              key={nft.id} 
              nft={nft} 
              showOwner={showOwner}
              showCreator={showCreator}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredNFTs.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-right">
          Showing {filteredNFTs.length} of {nfts.length} NFTs
        </div>
      )}
    </div>
  );
};

export default Gallery;