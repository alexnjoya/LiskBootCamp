import { useState } from 'react';
import type { NFT } from '../types/nft';
import { formatAddress } from '../services/web3Service';
import { getFromIPFS } from '../services/pinataService';
import { LISK_EXPLORER_URL } from '../utils/constants';

interface NFTCardProps {
  nft: NFT;
  showOwner?: boolean;
  showCreator?: boolean;
}

const NFTCard = ({ nft, showOwner = true, showCreator = true }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get image URL from IPFS
  const imageUrl = nft.metadata.image ? getFromIPFS(nft.metadata.image) : '';

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Open modal with NFT details
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="card overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        {/* NFT Image */}
        <div className="relative pb-[100%] bg-gray-100">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={nft.metadata.name}
              className="absolute w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
              <span>Image unavailable</span>
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {nft.metadata.name || `NFT #${nft.id}`}
            </h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              #{nft.id}
            </span>
          </div>

          {/* Description (truncated) */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {nft.metadata.description || 'No description available'}
          </p>

          {/* Owner/Creator Info */}
          <div className="text-xs text-gray-500 space-y-1">
            {showCreator && (
              <div className="flex justify-between">
                <span>Creator:</span>
                <a
                  href={`${LISK_EXPLORER_URL}/address/${nft.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {formatAddress(nft.creator)}
                </a>
              </div>
            )}
            
            {showOwner && (
              <div className="flex justify-between">
                <span>Owner:</span>
                <a
                  href={`${LISK_EXPLORER_URL}/address/${nft.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {formatAddress(nft.owner)}
                </a>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={openModal}
            className="mt-4 w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* NFT Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">NFT Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* NFT Image */}
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {!imageError ? (
                  <img
                    src={imageUrl}
                    alt={nft.metadata.name}
                    className="w-full h-auto object-contain max-h-[300px]"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center bg-gray-200 text-gray-500">
                    <span>Image unavailable</span>
                  </div>
                )}
              </div>

              {/* NFT Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold flex items-center">
                    {nft.metadata.name || `NFT #${nft.id}`}
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      #{nft.id}
                    </span>
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {nft.metadata.description || 'No description available'}
                  </p>
                </div>

                {/* Owner/Creator Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500">Creator</h5>
                    <a
                      href={`${LISK_EXPLORER_URL}/address/${nft.creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {nft.creator}
                    </a>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500">Owner</h5>
                    <a
                      href={`${LISK_EXPLORER_URL}/address/${nft.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {nft.owner}
                    </a>
                  </div>
                </div>

                {/* Attributes */}
                {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Attributes</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {nft.metadata.attributes.map((attr, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-100 rounded-md p-2 text-sm"
                        >
                          <div className="text-gray-500 text-xs">{attr.trait_type}</div>
                          <div className="font-medium text-gray-800">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Token URI */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-500">Token URI</h5>
                  <div className="text-gray-600 break-all text-sm">
                    {nft.tokenURI}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCard;