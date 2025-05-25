import type { NFTMetadata } from '../types/nft';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from './constants';

// Validate file for upload
export const validateFile = (file: File): { valid: boolean; message?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
    };
  }
  
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      message: `Unsupported file type. Supported types are: ${SUPPORTED_FILE_TYPES.join(', ')}` 
    };
  }
  
  return { valid: true };
};

// Generate file preview URL
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// Format date for display
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Create NFT metadata object
export const createNFTMetadata = (
  name: string,
  description: string,
  imageURI: string,
  attributes: Array<{ trait_type: string; value: string }> = []
): NFTMetadata => {
  return {
    name,
    description,
    image: imageURI,
    attributes
  };
};

// Check if a string is a valid URL
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Get file extension from file object
export const getFileExtension = (file: File): string => {
  return file.name.split('.').pop()?.toLowerCase() || '';
};

// Clean URL to display
export const cleanURL = (url: string): string => {
  return url
    .replace('https://', '')
    .replace('http://', '')
    .replace('ipfs://', 'ipfs://');
};