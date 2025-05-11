// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Escrow
 * @dev A simple escrow contract that allows a buyer to deposit funds,
 * and only release them to the seller after confirming receipt of goods.
 * The escrow can also be canceled by the buyer before confirmation or
 * by an arbiter in case of disputes.
 */
contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;
    bool public isConfirmed;
    bool public isCanceled;
    
    event Deposited(address indexed buyer, uint256 amount);
    event Confirmed(address indexed buyer, address indexed seller, uint256 amount);
    event Canceled(address indexed by, uint256 amount);
    
    constructor(address _seller, address _arbiter) payable {
        require(_seller != address(0), "Invalid seller address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }
    
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }
    
    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter can call this function");
        _;
    }
    
    modifier notConfirmed() {
        require(!isConfirmed, "Escrow has already been confirmed");
        _;
    }
    
    modifier notCanceled() {
        require(!isCanceled, "Escrow has already been canceled");
        _;
    }
    
    /**
     * @dev Confirms the receipt of goods and releases funds to the seller
     */
    function confirmReceipt() external onlyBuyer notConfirmed notCanceled {
        isConfirmed = true;
        
        // Transfer the funds to the seller
        (bool success, ) = seller.call{value: amount}("");
        require(success, "Transfer to seller failed");
        
        emit Confirmed(buyer, seller, amount);
    }
    
    /**
     * @dev Cancels the escrow and returns funds to the buyer
     * Can only be called by the buyer before confirmation or by the arbiter
     */
    function cancelEscrow() external notConfirmed notCanceled {
        require(msg.sender == buyer || msg.sender == arbiter, "Only buyer or arbiter can cancel");
        
        isCanceled = true;
        
        // Return the funds to the buyer
        (bool success, ) = buyer.call{value: amount}("");
        require(success, "Transfer to buyer failed");
        
        emit Canceled(msg.sender, amount);
    }
    
    /**
     * @dev Returns the current status of the escrow
     */
    function getStatus() external view returns (
        address _buyer,
        address _seller,
        address _arbiter,
        uint256 _amount,
        bool _isConfirmed,
        bool _isCanceled
    ) {
        return (buyer, seller, arbiter, amount, isConfirmed, isCanceled);
    }
}