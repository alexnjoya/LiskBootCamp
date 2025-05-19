// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;

    address public buyer = address(1);
    address public seller = address(2);
    address public arbiter = address(3);
    uint256 public depositAmount = 1 ether;

    // Setup function runs before each test
    function setUp() public {
        // Fund the buyer with some ETH
        vm.deal(buyer, 10 ether);

        // Deploy the escrow contract as the buyer
        vm.prank(buyer);
        escrow = new Escrow{value: depositAmount}(seller, arbiter);
    }

    // Test contract initialization
    function testInitialization() public {
        (address _buyer, address _seller, address _arbiter, uint256 _amount, bool _isConfirmed, bool _isCanceled) =
            escrow.getStatus();

        assertEq(_buyer, buyer, "Buyer should be set correctly");
        assertEq(_seller, seller, "Seller should be set correctly");
        assertEq(_arbiter, arbiter, "Arbiter should be set correctly");
        assertEq(_amount, depositAmount, "Deposit amount should be set correctly");
        assertFalse(_isConfirmed, "Escrow should not be confirmed initially");
        assertFalse(_isCanceled, "Escrow should not be canceled initially");
    }

    // Test successful confirmation and payment to seller
    function testConfirmReceipt() public {
        // Get the initial seller balance
        uint256 initialSellerBalance = address(seller).balance;

        // Buyer confirms receipt
        vm.prank(buyer);
        escrow.confirmReceipt();

        // Check seller received the funds
        assertEq(
            address(seller).balance, initialSellerBalance + depositAmount, "Seller should receive the deposited amount"
        );

        // Check escrow status
        (,,,, bool _isConfirmed,) = escrow.getStatus();
        assertTrue(_isConfirmed, "Escrow should be confirmed");
    }

    // Test cancellation by buyer
    function testCancelByBuyer() public {
        // Get initial buyer balance
        uint256 initialBuyerBalance = address(buyer).balance;

        // Buyer cancels escrow
        vm.prank(buyer);
        escrow.cancelEscrow();

        // Check buyer received the funds back
        assertEq(
            address(buyer).balance,
            initialBuyerBalance + depositAmount,
            "Buyer should receive the deposited amount back"
        );

        // Check escrow status
        (,,,,, bool _isCanceled) = escrow.getStatus();
        assertTrue(_isCanceled, "Escrow should be canceled");
    }

    // Test cancellation by arbiter
    function testCancelByArbiter() public {
        // Get initial buyer balance
        uint256 initialBuyerBalance = address(buyer).balance;

        // Arbiter cancels escrow
        vm.prank(arbiter);
        escrow.cancelEscrow();

        // Check buyer received the funds back
        assertEq(
            address(buyer).balance,
            initialBuyerBalance + depositAmount,
            "Buyer should receive the deposited amount back"
        );

        // Check escrow status
        (,,,,, bool _isCanceled) = escrow.getStatus();
        assertTrue(_isCanceled, "Escrow should be canceled");
    }

    // Test that non-buyer cannot confirm receipt
    function testCannotConfirmBySeller() public {
        // Seller tries to confirm receipt
        vm.prank(seller);
        vm.expectRevert("Only buyer can call this function");
        escrow.confirmReceipt();
    }

    // Test that non-buyer or non-arbiter cannot cancel
    function testCannotCancelBySeller() public {
        // Seller tries to cancel
        vm.prank(seller);
        vm.expectRevert("Only buyer or arbiter can cancel");
        escrow.cancelEscrow();
    }

    // Test cannot confirm after cancellation
    function testCannotConfirmAfterCancel() public {
        // First cancel the escrow
        vm.prank(buyer);
        escrow.cancelEscrow();

        // Try to confirm after cancellation
        vm.prank(buyer);
        vm.expectRevert("Escrow has already been canceled");
        escrow.confirmReceipt();
    }

    // Test cannot cancel after confirmation
    function testCannotCancelAfterConfirm() public {
        // First confirm the escrow
        vm.prank(buyer);
        escrow.confirmReceipt();

        // Try to cancel after confirmation
        vm.prank(buyer);
        vm.expectRevert("Escrow has already been confirmed");
        escrow.cancelEscrow();
    }

    // Test that contract reverts when created with zero deposit
    function testRevertsOnZeroDeposit() public {
        vm.prank(buyer);
        vm.expectRevert("Deposit amount must be greater than 0");
        new Escrow{value: 0}(seller, arbiter);
    }

    // Test that contract reverts when created with invalid seller address
    function testRevertsOnInvalidSellerAddress() public {
        vm.prank(buyer);
        vm.expectRevert("Invalid seller address");
        new Escrow{value: depositAmount}(address(0), arbiter);
    }

    // Test that contract reverts when created with invalid arbiter address
    function testRevertsOnInvalidArbiterAddress() public {
        vm.prank(buyer);
        vm.expectRevert("Invalid arbiter address");
        new Escrow{value: depositAmount}(seller, address(0));
    }
}
