// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatorToken
 * @dev ERC20 token that rewards NFT creators
 * Mintable only by the ArtNFT contract
 */
contract CreatorToken is ERC20, Ownable {
    address public artNFTContract;
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens with 18 decimals
    uint256 private _totalMinted;

    event ArtNFTContractUpdated(address indexed previousContract, address indexed newContract);

    modifier onlyArtNFT() {
        require(msg.sender == artNFTContract, "CreatorToken: caller is not the ArtNFT contract");
        _;
    }

    constructor() ERC20("CreatorToken", "CREATE") Ownable() {}

    /**
     * @dev Sets the ArtNFT contract address that is allowed to mint tokens
     * @param _artNFTContract Address of the ArtNFT contract
     */
    function setArtNFTContract(address _artNFTContract) external onlyOwner {
        require(_artNFTContract != address(0), "CreatorToken: invalid contract address");
        address oldContract = artNFTContract;
        artNFTContract = _artNFTContract;
        emit ArtNFTContractUpdated(oldContract, _artNFTContract);
    }

    /**
     * @dev Mints tokens to reward NFT creators
     * Can only be called by the ArtNFT contract
     * @param to Address of the creator to reward
     * @param amount Amount of tokens to mint
     */
    function rewardCreator(address to, uint256 amount) external onlyArtNFT {
        require(to != address(0), "CreatorToken: mint to zero address");
        require(_totalMinted + amount <= MAX_SUPPLY, "CreatorToken: exceeds max supply");
        
        _totalMinted += amount;
        _mint(to, amount);
    }

    /**
     * @dev Returns the total amount of tokens minted so far
     */
    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    /**
     * @dev Returns the remaining amount of tokens that can be minted
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _totalMinted;
    }
}