// Contract addresses
export const CREATOR_TOKEN_ADDRESS = import.meta.env.VITE_CREATOR_TOKEN_ADDRESS || '';
export const ART_NFT_ADDRESS = import.meta.env.VITE_ART_NFT_ADDRESS || '';

// Network
export const LISK_TESTNET_RPC_URL = import.meta.env.VITE_LISK_RPC_URL || 'https://testnet-rpc.lisk.com';
export const LISK_TESTNET_CHAIN_ID = 578; // Replace with actual Lisk testnet chain ID
export const LISK_TESTNET_NAME = 'Lisk Testnet';
export const LISK_EXPLORER_URL = 'https://testnet-explorer.lisk.com';

// NFT Categories
export const NFT_CATEGORIES = [
  'Art',
  'Photography',
  'Music',
  'Video',
  'Gaming',
  'Collectibles',
  'Sports',
  'Other'
];

// NFT attributes
export const NFT_ATTRIBUTES = [
  { name: 'Rarity', values: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] },
  { name: 'Type', values: ['Digital', 'Physical', 'Mixed Media'] },
  { name: 'Style', values: ['Abstract', 'Realistic', 'Pixel Art', 'Generative', '3D', 'Animation'] }
];

// App settings
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mp3', 'audio/wav'];