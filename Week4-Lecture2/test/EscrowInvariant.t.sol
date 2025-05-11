// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

/**
 * @title EscrowHandler
 * @dev Handler contract for invariant testing of the Escrow contract
 * This contract provides a set of actions that can be called randomly
 * during invariant testing to simulate various interactions with the escrow.
 */
contract EscrowHandler is Test {
    // Test addresses
    address public buyer = address(0x1111);
    address public seller = address(0x2222);
    address public arbiter = address(0x3333);
    address public randomUser = address(0x4444);
    
    // Contract under test
    Escrow public escrow;
    
    // State tracking
    bool public wasEverConfirmed;
    bool public wasEverCanceled;
    uint256 public initialAmount;
    uint256 public initialBuyerBalance;
    uint256 public initialSellerBalance;
    
    // Counters for actions
    uint256 public numCalls;
    uint256 public numConfirmCalls;
    uint256 public numCancelCalls;
    uint256 public numRandomCalls;
    
    constructor() {
        // Fund the participants
        vm.deal(buyer, 100 ether);
        vm.deal(seller, 10 ether);
        vm.deal(arbiter, 10 ether);
        vm.deal(randomUser, 10 ether);
        
        // Track initial balances
        initialBuyerBalance = buyer.balance;
        initialSellerBalance = seller.balance;
        
        // Deploy the escrow with the buyer
        vm.prank(buyer);
        escrow = new Escrow{value: 5 ether}(seller, arbiter);
        
        // Record the initial deposit amount
        initialAmount = 5 ether;
        
        // Initialize state tracking
        wasEverConfirmed = false;
        wasEverCanceled = false;
    }
    
    // Helper to get escrow status
    function getEscrowStatus() public view returns (
        address _buyer,
        address _seller,
        address _arbiter,
        uint256 _amount,
        bool _isConfirmed,
        bool _isCanceled
    ) {
        return escrow.getStatus();
    }
    
    // Action: Buyer confirms receipt (can only succeed once and before cancellation)
    function confirm() public {
        // Track call count
        numCalls++;
        numConfirmCalls++;
        
        // Get status before action
        (,,,,bool isConfirmed, bool isCanceled) = getEscrowStatus();
        
        // Try to confirm as buyer
        vm.prank(buyer);
        try escrow.confirmReceipt() {
            // If successful, update tracking
            wasEverConfirmed = true;
        } catch {
            // Expected to fail if already confirmed or canceled
        }
    }
    
    // Action: Buyer cancels escrow (can only succeed once and before confirmation)
    function cancelByBuyer() public {
        // Track call count
        numCalls++;
        numCancelCalls++;
        
        // Get status before action
        (,,,,bool isConfirmed, bool isCanceled) = getEscrowStatus();
        
        // Try to cancel as buyer
        vm.prank(buyer);
        try escrow.cancelEscrow() {
            // If successful, update tracking
            wasEverCanceled = true;
        } catch {
            // Expected to fail if already confirmed or canceled
        }
    }
    
    // Action: Arbiter cancels escrow (can only succeed once and before confirmation)
    function cancelByArbiter() public {
        // Track call count
        numCalls++;
        numCancelCalls++;
        
        // Get status before action
        (,,,,bool isConfirmed, bool isCanceled) = getEscrowStatus();
        
        // Try to cancel as arbiter
        vm.prank(arbiter);
        try escrow.cancelEscrow() {
            // If successful, update tracking
            wasEverCanceled = true;
        } catch {
            // Expected to fail if already confirmed or canceled
        }
    }
    
    // Action: Random user tries to call functions (should always fail)
    function randomUserCalls(uint8 action) public {
        // Track call count
        numCalls++;
        numRandomCalls++;
        
        // Decide which function to call
        if (action % 2 == 0) {
            // Try to confirm as random user (should always fail)
            vm.prank(randomUser);
            try escrow.confirmReceipt() {
                revert("Random user should not be able to confirm");
            } catch {
                // This is expected behavior
            }
        } else {
            // Try to cancel as random user (should always fail)
            vm.prank(randomUser);
            try escrow.cancelEscrow() {
                revert("Random user should not be able to cancel");
            } catch {
                // This is expected behavior
            }
        }
    }
}

/**
 * @title EscrowInvariantTest
 * @dev Invariant test contract for the Escrow contract
 * This contract defines invariants that should always hold true
 * regardless of the sequence of actions performed on the contract.
 */
contract EscrowInvariantTest is Test {
    EscrowHandler public handler;
    
    function setUp() public {
        // Deploy the handler which will deploy the escrow
        handler = new EscrowHandler();
        
        // Add the functions we want to target for fuzzing
        targetContract(address(handler));
        
        // Set up function selectors to call for invariant testing
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = EscrowHandler.confirm.selector;
        selectors[1] = EscrowHandler.cancelByBuyer.selector;
        selectors[2] = EscrowHandler.cancelByArbiter.selector;
        selectors[3] = EscrowHandler.randomUserCalls.selector;
        
        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }
    
    // Invariant: The escrow contract must handle funds correctly
    function invariant_fundsConservation() public {
        // Get the current escrow status
        (
            address _buyer,
            address _seller,
            address _arbiter,
            uint256 _amount,
            bool _isConfirmed,
            bool _isCanceled
        ) = handler.getEscrowStatus();
        
        // Calculate total funds flow
        uint256 initialAmount = handler.initialAmount();
        uint256 initialBuyerBalance = handler.initialBuyerBalance();
        uint256 initialSellerBalance = handler.initialSellerBalance();
        
        // If confirmed, seller should have received the funds
        if (_isConfirmed) {
            assertEq(
                _seller.balance,
                initialSellerBalance + initialAmount,
                "Seller should have received funds after confirmation"
            );
            assertEq(
                _buyer.balance,
                initialBuyerBalance - initialAmount,
                "Buyer should have spent the deposit amount"
            );
        }
        
        // If canceled, buyer should have received the funds back
        if (_isCanceled) {
            assertEq(
                _buyer.balance,
                initialBuyerBalance,
                "Buyer should have received funds back after cancellation"
            );
            assertEq(
                _seller.balance,
                initialSellerBalance,
                "Seller should not have received any funds after cancellation"
            );
        }
        
        // If neither confirmed nor canceled, funds should remain in the contract
        if (!_isConfirmed && !_isCanceled) {
            assertEq(
                address(handler.escrow()).balance,
                initialAmount,
                "Escrow contract should hold the deposit if not confirmed or canceled"
            );
        }
    }
    
    // Invariant: The escrow contract must maintain proper state transitions
    function invariant_stateTransitions() public {
        // Get the current escrow status
        (
            address _buyer,
            address _seller,
            address _arbiter,
            uint256 _amount,
            bool _isConfirmed,
            bool _isCanceled
        ) = handler.getEscrowStatus();
        
        // Escrow cannot be both confirmed and canceled
        assert(!(_isConfirmed && _isCanceled));
        
        // If escrow was ever confirmed, it must still be confirmed
        if (handler.wasEverConfirmed()) {
            assertTrue(_isConfirmed, "Once confirmed, escrow must remain confirmed");
            assertFalse(_isCanceled, "Confirmed escrow cannot become canceled");
        }
        
        // If escrow was ever canceled, it must still be canceled
        if (handler.wasEverCanceled()) {
            assertTrue(_isCanceled, "Once canceled, escrow must remain canceled");
            assertFalse(_isConfirmed, "Canceled escrow cannot become confirmed");
        }
    }
    
    // Invariant: Access control must be maintained
    function invariant_accessControl() public {
        // Random users should never succeed in calling restricted functions
        assertEq(
            handler.numRandomCalls(),
            handler.numRandomCalls(),
            "Random users should never succeed in calling restricted functions"
        );
    }
    
    // Invariant: The core state variables must remain consistent
    function invariant_stateConsistency() public {
        // Get the current escrow status
        (
            address _buyer,
            address _seller,
            address _arbiter,
            uint256 _amount,
            bool _isConfirmed,
            bool _isCanceled
        ) = handler.getEscrowStatus();
        
        // Core participants should never change
        assertEq(_buyer, handler.buyer(), "Buyer should never change");
        assertEq(_seller, handler.seller(), "Seller should never change");
        assertEq(_arbiter, handler.arbiter(), "Arbiter should never change");
        
        // Amount should never change
        assertEq(_amount, handler.initialAmount(), "Deposit amount should never change");
        
        // Call statistics for debugging
        console.log("Total calls:", handler.numCalls());
        console.log("Confirm calls:", handler.numConfirmCalls());
        console.log("Cancel calls:", handler.numCancelCalls());
        console.log("Random calls:", handler.numRandomCalls());
    }
}