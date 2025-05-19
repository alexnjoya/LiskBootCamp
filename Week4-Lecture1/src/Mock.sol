// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockParticipant
 * @dev Mock contract that simulates a participant in the escrow process
 * with various behaviors for testing edge cases
 */
contract MockParticipant {
    bool public rejectPayments;
    bool public reentryAttack;
    address public targetContract;
    string public lastFunctionCalled;
    uint256 public receivedAmount;
    uint256 public callCount;

    // Events for tracking interactions
    event Received(uint256 amount);
    event FunctionCalled(string functionName);

    constructor() {
        rejectPayments = false;
        reentryAttack = false;
    }

    // Function to toggle payment rejection
    function setRejectPayments(bool _reject) external {
        rejectPayments = _reject;
    }

    // Function to set up reentrancy attack
    function setupReentryAttack(bool _attack, address _target) external {
        reentryAttack = _attack;
        targetContract = _target;
    }

    // Function to record function calls
    function recordFunctionCall(string memory _functionName) external {
        lastFunctionCalled = _functionName;
        callCount++;
        emit FunctionCalled(_functionName);
    }

    // Fallback function to handle incoming ETH
    receive() external payable {
        if (rejectPayments) {
            // This will cause the transaction to fail
            revert("Payment rejected");
        }

        // Record the received amount
        receivedAmount += msg.value;
        emit Received(msg.value);

        // If reentrancy attack is enabled, attempt to call the target contract
        if (reentryAttack && targetContract != address(0)) {
            // Try to call the target contract again
            (bool success,) = targetContract.call(abi.encodeWithSignature("cancelEscrow()"));
            require(success, "Low-level call failed");
            // The success is ignored as we're just testing the behavior
        }
    }

    // Function to withdraw ETH (for testing)
    function withdraw() external {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}

/**
 * @title MockEscrowFactory
 * @dev Factory contract for creating multiple escrow instances
 * Used for testing batch operations and interactions
 */
contract MockEscrowFactory {
    address[] public escrows;
    uint256 public escrowCount;

    event EscrowCreated(address escrowAddress, address buyer, address seller, address arbiter, uint256 amount);

    // Function to create a new escrow
    function createEscrow(address _seller, address _arbiter) external payable returns (address) {
        // Create a new escrow with msg.value as deposit
        bytes memory bytecode = type(MockEscrow).creationCode;
        bytes memory initData = abi.encode(_seller, _arbiter);

        address payable escrowAddress;

        assembly {
            escrowAddress := create2(callvalue(), add(bytecode, 0x20), mload(bytecode), keccak256(initData, 0x40))
        }

        require(escrowAddress != address(0), "Escrow creation failed");

        escrows.push(escrowAddress);
        escrowCount++;

        emit EscrowCreated(escrowAddress, msg.sender, _seller, _arbiter, msg.value);

        return escrowAddress;
    }

    // Function to get all escrows
    function getAllEscrows() external view returns (address[] memory) {
        return escrows;
    }
}

/**
 * @title MockEscrow
 * @dev A simplified version of the escrow for use with the factory
 */
contract MockEscrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;
    bool public isConfirmed;
    bool public isCanceled;

    constructor(address _seller, address _arbiter) payable {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }

    function confirmReceipt() external {
        require(msg.sender == buyer, "Only buyer can call this function");
        require(!isConfirmed, "Escrow has already been confirmed");
        require(!isCanceled, "Escrow has already been canceled");

        isConfirmed = true;
        payable(seller).transfer(amount);
    }

    function cancelEscrow() external {
        require(msg.sender == buyer || msg.sender == arbiter, "Only buyer or arbiter can cancel");
        require(!isConfirmed, "Escrow has already been confirmed");
        require(!isCanceled, "Escrow has already been canceled");

        isCanceled = true;
        payable(buyer).transfer(amount);
    }
}
