// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CreatorToken.sol";
import "../src/ArtNFT.sol";

contract ArtNFTTest is Test {
    CreatorToken public token;
    ArtNFT public nft;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy CreatorToken
        token = new CreatorToken();
        
        // Deploy ArtNFT
        nft = new ArtNFT(address(token));
        
        // Set ArtNFT contract in CreatorToken
        token.setArtNFTContract(address(nft));
    }

    function testInitialState() public {
        assertEq(nft.name(), "ArtNFT");
        assertEq(nft.symbol(), "ANFT");
        assertEq(nft.totalSupply(), 0);
        assertEq(address(nft.creatorToken()), address(token));
        assertEq(nft.creatorRewardAmount(), 10 * 10**18);
        assertEq(nft.owner(), owner);
    }

    function testSetCreatorToken() public {
        CreatorToken newToken = new CreatorToken();
        nft.setCreatorToken(address(newToken));
        assertEq(address(nft.creatorToken()), address(newToken));
    }

    function test_RevertWhen_NonOwnerSetsCreatorToken() public {
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        nft.setCreatorToken(address(0x123));
    }

    function test_RevertWhen_SetCreatorTokenZeroAddress() public {
        vm.expectRevert("ArtNFT: invalid token address");
        nft.setCreatorToken(address(0));
    }

    function testSetCreatorRewardAmount() public {
        uint256 newAmount = 20 * 10**18;
        nft.setCreatorRewardAmount(newAmount);
        assertEq(nft.creatorRewardAmount(), newAmount);
    }

    function test_RevertWhen_NonOwnerSetsCreatorRewardAmount() public {
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        nft.setCreatorRewardAmount(20 * 10**18);
    }

    function testMintNFT() public {
        string memory tokenURI = "ipfs://QmTest";
        
        // Mint NFT as user1
        vm.prank(user1);
        uint256 tokenId = nft.mintNFT(tokenURI);
        
        // Check NFT data
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.tokenURI(tokenId), tokenURI);
        assertEq(nft.getCreator(tokenId), user1);
        assertEq(nft.totalSupply(), 1);
        
        // Check that creator received tokens
        assertEq(token.balanceOf(user1), nft.creatorRewardAmount());
    }

    function testMultipleMints() public {
        // Mint NFT 1 as user1
        vm.prank(user1);
        uint256 tokenId1 = nft.mintNFT("ipfs://QmTest1");
        
        // Mint NFT 2 as user2
        vm.prank(user2);
        uint256 tokenId2 = nft.mintNFT("ipfs://QmTest2");
        
        // Check NFT data
        assertEq(tokenId1, 0);
        assertEq(tokenId2, 1);
        assertEq(nft.ownerOf(tokenId1), user1);
        assertEq(nft.ownerOf(tokenId2), user2);
        assertEq(nft.getCreator(tokenId1), user1);
        assertEq(nft.getCreator(tokenId2), user2);
        assertEq(nft.totalSupply(), 2);
        
        // Check that creators received tokens
        assertEq(token.balanceOf(user1), nft.creatorRewardAmount());
        assertEq(token.balanceOf(user2), nft.creatorRewardAmount());
    }

    function testTransferNFT() public {
        // Mint NFT as user1
        vm.prank(user1);
        uint256 tokenId = nft.mintNFT("ipfs://QmTest");
        
        // Transfer NFT to user2
        vm.prank(user1);
        nft.transferFrom(user1, user2, tokenId);
        
        // Check new owner
        assertEq(nft.ownerOf(tokenId), user2);
        
        // Creator should remain user1
        assertEq(nft.getCreator(tokenId), user1);
        
        // Creator token balance should be unchanged
        assertEq(token.balanceOf(user1), nft.creatorRewardAmount());
        assertEq(token.balanceOf(user2), 0);
    }

    function test_RevertWhen_GetCreatorNonexistentToken() public {
        vm.expectRevert("ArtNFT: query for nonexistent token");
        nft.getCreator(999);
    }
}