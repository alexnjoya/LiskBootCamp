// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SmartWallet
 * @dev A basic smart wallet implementation simulating EIP-4337 functionality
 */
contract SmartWallet {
    address public owner;
    uint256 public nonce;  // To prevent replay attacks
    
    // Events
    event Executed(address to, uint256 value, bytes data, uint256 nonce);
    event SignatureValidated(address signer, uint256 nonce);
    
    /**
     * @dev Constructor sets the owner of the wallet
     */
    constructor(address _owner) {
        owner = _owner;
        nonce = 0;
    }
    
    /**
     * @dev Modifier to restrict functions to the wallet owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    /**
     * @dev Execute a transaction to any contract or EOA
     * @param to The target address
     * @param value The amount of ETH to send
     * @param data The calldata to pass to the target
     */
    function execute(address to, uint256 value, bytes calldata data) external onlyOwner returns (bytes memory) {
        // Increment nonce to prevent replay attacks
        nonce++;
        
        // Execute the call
        bool success;
        bytes memory result;
        
        (success, result) = to.call{value: value}(data);
        require(success, "Transaction execution failed");
        
        emit Executed(to, value, data, nonce - 1);
        return result;
    }
    
    /**
     * @dev Simulate validating a user operation from EIP-4337
     * In a real implementation, this would verify signatures against the EntryPoint contract
     * @param userOpHash The hash of the user operation
     * @param signature The signature to validate
     * @return validationData A packed value encoding the validation result
     */
    function validateUserOp(bytes32 userOpHash, bytes calldata signature) external returns (uint256 validationData) {
        // Simple simulation of signature validation
        // In a real implementation, this would recover the signer and verify against owner
        
        // For simulation, we'll just check a minimum signature length
        require(signature.length >= 65, "Invalid signature length");
        
        // This validates that the signature contains the expected prefix
        // In a real implementation, we would use ecrecover to check the actual signature
        require(signature.length > 4 && 
                signature[0] == 0x19 && 
                signature[1] == 0x01, 
                "Invalid signature format");
        
        // Increment nonce for this validation
        nonce++;
        
        emit SignatureValidated(owner, nonce - 1);
        
        // Return 0 to indicate successful validation
        // In EIP-4337, validationData can encode more information:
        // - The bottom 160 bits can specify a validation address
        // - Bits 160-192 can specify a validUntil timestamp
        // - Bits 192-224 can specify a validAfter timestamp
        return 0;
    }
    
    /**
     * @dev Receive function to accept ETH payments
     */
    receive() external payable {}
}

/**
 * @title Paymaster
 * @dev A simple Paymaster contract that simulates gas sponsorship
 */
contract Paymaster {
    address public owner;
    mapping(address => bool) public sponsoredWallets;
    
    // Events
    event GasSponsored(address indexed wallet, uint256 gasUsed, uint256 timestamp);
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a wallet to the sponsored list
     * @param wallet The smart wallet address to sponsor
     */
    function addSponsoredWallet(address wallet) external {
        require(msg.sender == owner, "Not authorized");
        sponsoredWallets[wallet] = true;
    }
    
    /**
     * @dev Remove a wallet from the sponsored list
     * @param wallet The smart wallet address to remove
     */
    function removeSponsoredWallet(address wallet) external {
        require(msg.sender == owner, "Not authorized");
        sponsoredWallets[wallet] = false;
    }
    
    /**
     * @dev Validate and pay for gas for a user operation
     * @param sender The wallet initiating the operation
     * @param gasUsed Estimated gas that will be used
     * @return success Whether the paymaster agrees to pay
     */
    function validateAndPayForGas(address sender, uint256 gasUsed) external returns (bool success) {
        // Check if this wallet is eligible for sponsorship
        require(sponsoredWallets[sender], "Wallet not sponsored");
        
        // Log the gas sponsorship
        emit GasSponsored(sender, gasUsed, block.timestamp);
        
        // In a real implementation, this would handle the actual payment
        // For this simulation, we just return success
        return true;
    }
    
    /**
     * @dev Deposit function to fund the paymaster
     */
    receive() external payable {}
}