import { ethers } from 'ethers';

export interface ContractAddresses {
  creatorToken: string;
  artNFT: string;
}

export interface ContractInstances {
  creatorToken: ethers.Contract | null;
  artNFT: ethers.Contract | null;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  message?: string;
}