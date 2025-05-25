// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CreatorToken.sol";

contract CreatorTokenTest is Test {
    CreatorToken public token;
    address public owner;
    address public artNFTContract;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        artNFTContract = makeAddr("artNFTContract");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy CreatorToken
        token = new CreatorToken();
        
        // Set ArtNFT contract
        token.setArtNFTContract(artNFTContract);
    }

    function testInitialState() public {
        assertEq(token.name(), "CreatorToken");
        assertEq(token.symbol(), "CREATE");
        assertEq(token.totalSupply(), 0);
        assertEq(token.artNFTContract(), artNFTContract);
        assertEq(token.owner(), owner);
    }

    function testSetArtNFTContract() public {
        address newArtNFTContract = makeAddr("newArtNFTContract");
        token.setArtNFTContract(newArtNFTContract);
        assertEq(token.artNFTContract(), newArtNFTContract);
    }

    function testFailSetArtNFTContractNonOwner() public {
        vm.prank(user1);
        token.setArtNFTContract(address(0x123));
    }

    function testFailSetArtNFTContractZeroAddress() public {
        token.setArtNFTContract(address(0));
    }

    function testRewardCreator() public {
        uint256 rewardAmount = 100 * 10**18;
        
        // Mint tokens to user1
        vm.prank(artNFTContract);
        token.rewardCreator(user1, rewardAmount);
        
        assertEq(token.balanceOf(user1), rewardAmount);
        assertEq(token.totalSupply(), rewardAmount);
        assertEq(token.totalMinted(), rewardAmount);
    }

    function testFailRewardCreatorNonArtNFT() public {
        vm.prank(user1);
        token.rewardCreator(user1, 100 * 10**18);
    }

    function testFailRewardCreatorZeroAddress() public {
        vm.prank(artNFTContract);
        token.rewardCreator(address(0), 100 * 10**18);
    }

    function testMaxSupply() public {
        uint256 maxSupply = token.MAX_SUPPLY();
        
        // Try to mint more than max supply
        vm.prank(artNFTContract);
        vm.expectRevert("CreatorToken: exceeds max supply");
        token.rewardCreator(user1, maxSupply + 1);
        
        // Mint max supply
        vm.prank(artNFTContract);
        token.rewardCreator(user1, maxSupply);
        
        assertEq(token.totalSupply(), maxSupply);
        assertEq(token.totalMinted(), maxSupply);
        assertEq(token.remainingSupply(), 0);
    }

    function testTransfer() public {
        uint256 amount = 100 * 10**18;
        
        // Mint tokens to user1
        vm.prank(artNFTContract);
        token.rewardCreator(user1, amount);
        
        // Transfer tokens from user1 to user2
        vm.prank(user1);
        token.transfer(user2, amount / 2);
        
        assertEq(token.balanceOf(user1), amount / 2);
        assertEq(token.balanceOf(user2), amount / 2);
    }

    function testApproveAndTransferFrom() public {
        uint256 amount = 100 * 10**18;
        
        // Mint tokens to user1
        vm.prank(artNFTContract);
        token.rewardCreator(user1, amount);
        
        // Approve user2 to spend tokens
        vm.prank(user1);
        token.approve(user2, amount / 2);
        
        assertEq(token.allowance(user1, user2), amount / 2);
        
        // Transfer tokens from user1 to owner using user2
        vm.prank(user2);
        token.transferFrom(user1, owner, amount / 2);
        
        assertEq(token.balanceOf(user1), amount / 2);
        assertEq(token.balanceOf(owner), amount / 2);
        assertEq(token.allowance(user1, user2), 0);
    }
}