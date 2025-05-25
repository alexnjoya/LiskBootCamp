import React from 'react';
import { Link } from 'react-router-dom';
import { ART_NFT_ADDRESS, CREATOR_TOKEN_ADDRESS, LISK_EXPLORER_URL } from '../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Tagline */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              NFT Creator
            </Link>
            <p className="mt-2 text-gray-400">
              Mint NFTs and earn creator tokens on the Lisk blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mint" className="text-gray-400 hover:text-white transition-colors">
                  Mint NFT
                </Link>
              </li>
              <li>
                <Link to="/my-nfts" className="text-gray-400 hover:text-white transition-colors">
                  My NFTs
                </Link>
              </li>
              <li>
                <Link to="/token-info" className="text-gray-400 hover:text-white transition-colors">
                  Token Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contract Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contract Information</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <span className="font-medium">CreatorToken:</span>{' '}
                <a
                  href={`${LISK_EXPLORER_URL}/address/${CREATOR_TOKEN_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors break-all"
                >
                  {CREATOR_TOKEN_ADDRESS.slice(0, 8)}...{CREATOR_TOKEN_ADDRESS.slice(-6)}
                </a>
              </li>
              <li className="text-gray-400">
                <span className="font-medium">ArtNFT:</span>{' '}
                <a
                  href={`${LISK_EXPLORER_URL}/address/${ART_NFT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors break-all"
                >
                  {ART_NFT_ADDRESS.slice(0, 8)}...{ART_NFT_ADDRESS.slice(-6)}
                </a>
              </li>
              <li className="text-gray-400">
                <span className="font-medium">Network:</span> Lisk Testnet
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          &copy; {currentYear} NFT Creator Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;