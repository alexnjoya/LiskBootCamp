import axios from 'axios';
import type { NFTMetadata, PinataResponse } from '@/types/nft';

// Pinata API config
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

const JWT = import.meta.env.VITE_PINATA_JWT;

const pinataApiClient = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: JWT ? {
    Authorization: `Bearer ${JWT}`
  } : {
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_API_KEY
  }
});

export const uploadToPinata = async (file: File): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Set pinata options
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    // Upload file to IPFS via Pinata
    const response = await pinataApiClient.post<PinataResponse>('/pinning/pinFileToIPFS', formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Return IPFS hash/CID
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};

export const uploadMetadataToPinata = async (metadata: NFTMetadata): Promise<string> => {
  try {
    // Upload metadata JSON to IPFS via Pinata
    const response = await pinataApiClient.post<PinataResponse>('/pinning/pinJSONToIPFS', metadata, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return IPFS hash/CID
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw error;
  }
};

export const getFromIPFS = (ipfsHash: string): string => {
  // If it's already a HTTP URL, return it
  if (ipfsHash.startsWith('http')) {
    return ipfsHash;
  }
  
  // Convert IPFS URL to HTTP URL using Pinata gateway
  const cid = ipfsHash.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};