// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

// Mock contract for participants (buyer, seller, arbiter)
contract MockParticipant {
    bool private rejectPayments;
    bool private attemptReentry;
    address private targetContract;
    
    // Called when receiving ETH
    receive() external payable {
        // Simulate failed payment if configured
        if (rejectPayments) {
            revert("Payment rejected");
        }
        
        // Attempt reentrancy attack if configured
        if (attemptReentry && targetContract != address(0)) {
            // Call the target contract to attempt reentrancy
            // We ignore the return value since we don't need it
            targetContract.call(abi.encodeWithSignature("cancelEscrow()"));
            // This is just an attack simulation
        }
    }
    
    function setRejectPayments(bool _reject) external {
        rejectPayments = _reject;
    }
    
    function setupReentryAttack(bool _attempt, address _target) external {
        attemptReentry = _attempt;
        targetContract = _target;
    }
}

// Mock Escrow contract - a simplified version for testing the factory
contract MockEscrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;
    bool public isConfirmed;
    bool public isCanceled;
    
    constructor(address _buyer, address _seller, address _arbiter) payable {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }
    
    function getStatus() external view returns (
        address, address, address, uint256, bool, bool
    ) {
        return (buyer, seller, arbiter, amount, isConfirmed, isCanceled);
    }
}

// Contract that deliberately has no receive function
contract ContractWithNoReceive {
    // Deliberately missing receive() function
    
    // Fallback function that always reverts - simulates a contract that can't receive ETH
    fallback() external {
        revert("Cannot receive ETH");
    }
}

// Mock Escrow Factory with proper implementation
contract MockEscrowFactory {
    address[] public escrows;
    
    function createEscrow(address _seller, address _arbiter) external payable returns (address) {
        // Create new mock escrow with proper funding
        MockEscrow newEscrow = new MockEscrow{value: msg.value}(
            msg.sender,
            _seller,
            _arbiter
        );
        
        // Store the escrow address
        escrows.push(address(newEscrow));
        
        return address(newEscrow);
    }
    
    function getAllEscrows() external view returns (address[] memory) {
        return escrows;
    }
    
    // Add receive function to accept ETH
    receive() external payable {}
}

// Actual Escrow contract implementation for reference (in case we need to modify it)
contract EscrowImpl is Escrow {
    constructor(address _seller, address _arbiter) Escrow(_seller, _arbiter) payable {}
}

contract EscrowIntegrationTest is Test {
    // Declaration of test variables
    MockParticipant public mockBuyer;
    MockParticipant public mockSeller;
    MockParticipant public mockArbiter;
    MockEscrowFactory public factory;
    
    // Set up default values
    uint256 public defaultDepositAmount = 1 ether;
    
    // Setup function runs before each test
    function setUp() public {
        // Deploy mock contracts
        mockBuyer = new MockParticipant();
        mockSeller = new MockParticipant();
        mockArbiter = new MockParticipant();
        factory = new MockEscrowFactory();
        
        // Fund the mock buyer
        vm.deal(address(mockBuyer), 10 ether);
        
        // Fund the test contract for tests that send from this contract
        vm.deal(address(this), 10 ether);
    }
    
    // Test escrow with mock participants
    function testEscrowWithMockParticipants() public {
        // Create the escrow contract through the buyer mock
        vm.prank(address(mockBuyer));
        Escrow escrow = new Escrow{value: defaultDepositAmount}(
            address(mockSeller), 
            address(mockArbiter)
        );
        
        // Record the seller's initial balance
        uint256 initialSellerBalance = address(mockSeller).balance;
        
        // Buyer confirms receipt
        vm.prank(address(mockBuyer));
        escrow.confirmReceipt();
        
        // Verify seller received the funds
        assertEq(
            address(mockSeller).balance,
            initialSellerBalance + defaultDepositAmount,
            "Mock seller should receive the deposited amount"
        );
    }
    
    // Test escrow cancellation with mock participants
    function testEscrowCancellationWithMockParticipants() public {
        // Create the escrow contract through the buyer mock
        vm.prank(address(mockBuyer));
        Escrow escrow = new Escrow{value: defaultDepositAmount}(
            address(mockSeller), 
            address(mockArbiter)
        );
        
        // Record the buyer's balance after escrow creation
        uint256 buyerBalanceAfterCreation = address(mockBuyer).balance;
        
        // Arbiter cancels escrow
        vm.prank(address(mockArbiter));
        escrow.cancelEscrow();
        
        // Verify buyer received the funds back
        assertEq(
            address(mockBuyer).balance,
            buyerBalanceAfterCreation + defaultDepositAmount,
            "Mock buyer should receive the deposited amount back"
        );
    }
    
    // Test escrow with a factory contract
    function testEscrowWithFactory() public {
        // Fund the factory 
        vm.deal(address(factory), 5 ether);
        
        // Create an escrow through the factory
        vm.prank(address(mockBuyer));
        address escrowAddress = factory.createEscrow{value: defaultDepositAmount}(
            address(mockSeller),
            address(mockArbiter)
        );
        
        // Get the escrow instance
        MockEscrow escrow = MockEscrow(payable(escrowAddress));
        
        // Verify escrow details
        assertEq(escrow.buyer(), address(mockBuyer), "Buyer should be set correctly");
        assertEq(escrow.seller(), address(mockSeller), "Seller should be set correctly");
        assertEq(escrow.arbiter(), address(mockArbiter), "Arbiter should be set correctly");
        assertEq(escrow.amount(), defaultDepositAmount, "Amount should be set correctly");
    }
    
    // Test handling failed payments
    function testHandlingFailedPayments() public {
        // Create the escrow contract through the buyer mock
        vm.prank(address(mockBuyer));
        Escrow escrow = new Escrow{value: defaultDepositAmount}(
            address(mockSeller), 
            address(mockArbiter)
        );
        
        // Configure seller to reject payments
        mockSeller.setRejectPayments(true);
        
        // Expect revert when buyer confirms receipt due to seller rejecting payment
        vm.prank(address(mockBuyer));
        vm.expectRevert("Transfer to seller failed");
        escrow.confirmReceipt();
    }
    
    // Test handling reentrancy attempts
    function testHandlingReentrantCalls() public {
        // Create the escrow contract through the buyer mock
        vm.prank(address(mockBuyer));
        Escrow escrow = new Escrow{value: defaultDepositAmount}(
            address(mockSeller), 
            address(mockArbiter)
        );
        
        // Set up the mock buyer to attempt a reentrancy attack
        mockBuyer.setupReentryAttack(true, address(escrow));
        
        // Arbiter cancels escrow - this should not be vulnerable to reentrancy
        vm.prank(address(mockArbiter));
        escrow.cancelEscrow();
        
        // Check that the escrow is properly canceled
        (,,,,,bool canceled) = escrow.getStatus();
        assertTrue(canceled, "Escrow should be canceled despite reentrancy attempt");
        
        // Verify that funds were returned exactly once (no double spending)
        uint256 expectedBuyerBalance = 10 ether - defaultDepositAmount + defaultDepositAmount;
        assertEq(
            address(mockBuyer).balance,
            expectedBuyerBalance,
            "Buyer should receive the exact deposited amount back"
        );
    }
    
    // Test creating multiple escrows through the factory
    function testMultipleEscrowsWithFactory() public {
        // Fund the mock buyer for multiple escrows
        vm.deal(address(mockBuyer), 10 ether);
        
        // Create 3 different escrows from mockBuyer
        address[] memory escrowAddresses = new address[](3);
        
        for (uint256 i = 0; i < 3; i++) {
            uint256 amount = (i + 1) * 0.5 ether;
            vm.prank(address(mockBuyer));
            escrowAddresses[i] = factory.createEscrow{value: amount}(
                address(mockSeller),
                address(mockArbiter)
            );
        }
        
        // Verify escrow creation
        address[] memory factoryEscrows = factory.getAllEscrows();
        assertEq(factoryEscrows.length, 3, "Factory should have created 3 escrows");
        
        // Verify each escrow's details
        for (uint256 i = 0; i < 3; i++) {
            MockEscrow escrow = MockEscrow(payable(factoryEscrows[i]));
            assertEq(escrow.amount(), (i + 1) * 0.5 ether, "Amount should match for each escrow");
            assertEq(escrow.seller(), address(mockSeller), "Seller should be correct");
        }
    }
    
    // Test edge case: eth transfer to a contract with no receive function
    function testTransferToContractWithNoReceiveFunction() public {
        // Create a contract with no receive function
        ContractWithNoReceive noReceiveContract = new ContractWithNoReceive();
        
        // Create escrow with the contract as seller
        vm.prank(address(mockBuyer));
        Escrow escrow = new Escrow{value: defaultDepositAmount}(
            address(noReceiveContract), 
            address(mockArbiter)
        );
        
        // Expect revert when buyer confirms receipt
        vm.prank(address(mockBuyer));
        vm.expectRevert("Transfer to seller failed");
        escrow.confirmReceipt();
    }
    
    // Helper function to compare escrow status
    function verifyEscrowStatus(
        Escrow escrow, 
        address expectedBuyer,
        address expectedSeller,
        address expectedArbiter,
        uint256 expectedAmount,
        bool expectedConfirmed,
        bool expectedCanceled
    ) public view {
        (
            address actualBuyer,
            address actualSeller,
            address actualArbiter,
            uint256 actualAmount,
            bool actualConfirmed,
            bool actualCanceled
        ) = escrow.getStatus();
        
        assertEq(actualBuyer, expectedBuyer, "Buyer mismatch");
        assertEq(actualSeller, expectedSeller, "Seller mismatch");
        assertEq(actualArbiter, expectedArbiter, "Arbiter mismatch");
        assertEq(actualAmount, expectedAmount, "Amount mismatch");
        assertEq(actualConfirmed, expectedConfirmed, "Confirmation status mismatch");
        assertEq(actualCanceled, expectedCanceled, "Cancellation status mismatch");
    }
    
    // Necessary to receive ETH
    receive() external payable {}
}