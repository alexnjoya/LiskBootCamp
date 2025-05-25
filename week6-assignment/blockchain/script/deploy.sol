// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CreatorToken.sol";
import "../src/ArtNFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CreatorToken
        CreatorToken creatorToken = new CreatorToken();
        console.log("CreatorToken deployed at:", address(creatorToken));
        
        // Deploy ArtNFT with CreatorToken address
        ArtNFT artNFT = new ArtNFT(address(creatorToken));
        console.log("ArtNFT deployed at:", address(artNFT));
        
        // Set ArtNFT contract in CreatorToken
        creatorToken.setArtNFTContract(address(artNFT));
        console.log("ArtNFT contract set in CreatorToken");
        
        vm.stopBroadcast();
    }
}