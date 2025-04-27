// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {LotteryGame} from "../src/LotteryGame.sol";

contract LotteryGameScript is Script {
    LotteryGame public lotteryGame;

    function setUp() public {}

    function run() public {
        // Log the start of deployment
        console.log("Deploying LotteryGame contract...");
        
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the LotteryGame contract
        lotteryGame = new LotteryGame();
        
        // Log the contract address
        console.log("LotteryGame deployed at:", address(lotteryGame));

        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}