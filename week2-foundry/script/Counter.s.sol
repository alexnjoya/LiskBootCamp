// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract CounterScript is Script {
    Counter public counter;
    
    function setUp() public {}
    
    function run() public {
        vm.startBroadcast();
        
        counter = new Counter();
        console.log("Counter deployed at:", address(counter));
        
        vm.stopBroadcast();
    }
}