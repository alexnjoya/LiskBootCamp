// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CreatorToken.sol";

/**
 * @title ArtNFT
 * @dev ERC721 token that allows anyone to mint NFTs and rewards creators
 */
contract ArtNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    CreatorToken public creatorToken;
    
    // Reward amount per NFT mint (in CreatorToken)
    uint256 public creatorRewardAmount = 10 * 10**18; // 10 tokens with 18 decimals
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) public tokenCreators;
    
    // Event emitted when a new NFT is minted
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    
    constructor(address _creatorTokenAddress) ERC721("ArtNFT", "ANFT") Ownable() {
        require(_creatorTokenAddress != address(0), "ArtNFT: invalid token address");
        creatorToken = CreatorToken(_creatorTokenAddress);
    }
    
    /**
     * @dev Updates the creator token address
     * @param _creatorTokenAddress New creator token address
     */
    function setCreatorToken(address _creatorTokenAddress) external onlyOwner {
        require(_creatorTokenAddress != address(0), "ArtNFT: invalid token address");
        creatorToken = CreatorToken(_creatorTokenAddress);
    }
    
    /**
     * @dev Updates the reward amount per NFT mint
     * @param _amount New reward amount
     */
    function setCreatorRewardAmount(uint256 _amount) external onlyOwner {
        creatorRewardAmount = _amount;
    }
    
    /**
     * @dev Mints a new NFT with the provided metadata URI
     * @param _tokenURI Metadata URI for the NFT
     * @return tokenId The ID of the newly minted NFT
     */
    function mintNFT(string memory _tokenURI) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Store the creator address
        tokenCreators[tokenId] = msg.sender;
        
        // Reward the creator with tokens
        creatorToken.rewardCreator(msg.sender, creatorRewardAmount);
        
        // Emit the minting event
        emit NFTMinted(tokenId, msg.sender, _tokenURI);
        
        return tokenId;
    }
    
    /**
     * @dev Returns the creator of a specific token
     * @param _tokenId Token ID to query
     * @return Creator address
     */
    function getCreator(uint256 _tokenId) external view returns (address) {
        require(_exists(_tokenId), "ArtNFT: query for nonexistent token");
        return tokenCreators[_tokenId];
    }
    
    /**
     * @dev Returns the total number of NFTs minted
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Checks if a token exists
     * @param _tokenId Token ID to query
     * @return True if the token exists
     */
    function _exists(uint256 _tokenId) internal view override returns (bool) {
        return _ownerOf(_tokenId) != address(0);
    }
}