// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Ownable.sol";

/**
 * @title VotingSystem
 * @dev Implements a decentralized voting system where candidates can be registered and users can vote
 */
contract VotingSystem is Ownable {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    
    // Mappings
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    
    // State variables
    uint public candidatesCount;
    
    // Events
    event CandidateAdded(uint candidateId, string name);
    event VoteCast(address voter, uint candidateId);
    
    /**
     * @dev Constructor initializes the contract
     */
    constructor() Ownable() {}
    
    /**
     * @dev Add a new candidate - only the owner can call this function
     * @param name The name of the candidate to add
     */
    function addCandidate(string calldata name) external onlyOwner {
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
        emit CandidateAdded(candidatesCount, name);
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param candidateId The ID of the candidate to vote for
     */
    function vote(uint candidateId) external {
        // Check if voter has already voted
        require(!voters[msg.sender], "You have already voted");
        
        // Check if candidate exists
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate ID");
        
        // Record that voter has voted
        voters[msg.sender] = true;
        
        // Increment vote count for the selected candidate
        candidates[candidateId].voteCount++;
        
        emit VoteCast(msg.sender, candidateId);
    }
    
    /**
     * @dev Get details of a specific candidate
     * @param candidateId The ID of the candidate
     * @return name The name of the candidate
     * @return voteCount The number of votes for the candidate
     */
    function getCandidate(uint candidateId) public view returns (string memory name, uint voteCount) {
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate storage candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount);
    }
    
    /**
     * @dev Get the total number of candidates
     * @return The total count of candidates
     */
    function getTotalCandidates() public view returns (uint) {
        return candidatesCount;
    }
    
    /**
     * @dev Check if an address has already voted
     * @param voter The address to check
     * @return Whether the address has voted
     */
    function hasVoted(address voter) public view returns (bool) {
        return voters[voter];
    }
}