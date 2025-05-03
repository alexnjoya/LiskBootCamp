// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/VotingSystem.sol";
import "../src/Ownable.sol";

contract TestVotingSystem is Test {
    VotingSystem votingSystem;
    address owner = address(1);
    address voter1 = address(2);
    address voter2 = address(3);
    
    function setUp() public {
        vm.prank(owner);
        votingSystem = new VotingSystem();
    }
    
    function Ownership() public view {
        assertEq(votingSystem.owner(), owner);
    }
    
    function test_AddCandidate() public {
        vm.prank(owner);
        votingSystem.addCandidate("Alice");
        
        (string memory name, uint voteCount) = votingSystem.getCandidate(1);
        assertEq(name, "Alice");
        assertEq(voteCount, 0);
        assertEq(votingSystem.getTotalCandidates(), 1);
    }
    
    function test_RevertWhen_NonOwnerAddsCandidate() public {
        vm.prank(voter1);
        vm.expectRevert("Ownable: caller is not the owner");
        votingSystem.addCandidate("Bob");
    }
    
    function test_Voting() public {
        // Add candidates
        vm.prank(owner);
        votingSystem.addCandidate("Alice");
        vm.prank(owner);
        votingSystem.addCandidate("Bob");
        
        // Cast votes
        vm.prank(voter1);
        votingSystem.vote(1);
        
        vm.prank(voter2);
        votingSystem.vote(2);
        
        // Check results
        (string memory name1, uint voteCount1) = votingSystem.getCandidate(1);
        (string memory name2, uint voteCount2) = votingSystem.getCandidate(2);
        
        assertEq(name1, "Alice");
        assertEq(voteCount1, 1);
        assertEq(name2, "Bob");
        assertEq(voteCount2, 1);
        
        // Check if voters have voted
        assertTrue(votingSystem.hasVoted(voter1));
        assertTrue(votingSystem.hasVoted(voter2));
    }
    
    function test_RevertWhen_VotingTwice() public {
        // Add candidate
        vm.prank(owner);
        votingSystem.addCandidate("Alice");
        
        // First vote (should succeed)
        vm.prank(voter1);
        votingSystem.vote(1);
        
        // Second vote (should revert)
        vm.prank(voter1);
        vm.expectRevert("You have already voted");
        votingSystem.vote(1);
    }
    
    function test_RevertWhen_VotingForInvalidCandidate() public {
        vm.prank(voter1);
        vm.expectRevert("Invalid candidate ID");
        votingSystem.vote(999); // Non-existent candidate ID
    }
    
    function test_GetTotalCandidates() public {
        assertEq(votingSystem.getTotalCandidates(), 0);
        
        vm.prank(owner);
        votingSystem.addCandidate("Alice");
        assertEq(votingSystem.getTotalCandidates(), 1);
        
        vm.prank(owner);
        votingSystem.addCandidate("Bob");
        assertEq(votingSystem.getTotalCandidates(), 2);
    }
    
    function test_RevertWhen_GettingInvalidCandidate() public {
        vm.expectRevert("Invalid candidate ID");
        votingSystem.getCandidate(999);
    }
    
    function test_RevertWhen_AddingEmptyName() public {
        vm.prank(owner);
        vm.expectRevert("Candidate name cannot be empty");
        votingSystem.addCandidate("");
    }
}