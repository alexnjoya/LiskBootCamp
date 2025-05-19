// script/DeployMyContract.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract DeployMyContract is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Define seller and arbiter addresses
        address  arbiter= 0x94bd73189c1bf1a1f849e45A9B0E81cEEEf31E65; // Replace with actual seller address
        address seller= 0x869C7b17AcfF9227cBe1aCFde2c63C8A3BE4276F; // Replace with actual arbiter address
        
        // Define deposit amount
        uint256 depositAmount = 0.1 ether; // Adjust the amount as needed
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract with constructor args and send ETH
        Escrow escrow = new Escrow{value: depositAmount}(seller, arbiter);
        
        vm.stopBroadcast();
        
        console.log("Contract deployed at:", address(escrow));
        console.log("Seller address:", seller);
        console.log("Arbiter address:", arbiter);
        console.log("Deposit amount:", depositAmount);
    }
}