// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VotingSystem.sol";

contract DeployVotingSystem is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        VotingSystem votingSystem = new VotingSystem();
        
        // Optionally add some initial candidates
        votingSystem.addCandidate("Candidate 1");
        votingSystem.addCandidate("Candidate 2");
        
        vm.stopBroadcast();
    }
}