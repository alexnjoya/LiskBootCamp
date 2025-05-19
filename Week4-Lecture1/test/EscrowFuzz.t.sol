// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

contract EscrowFuzzTest is Test {
    // Set up addresses for testing
    address public constant DEFAULT_BUYER = address(0x1);
    address public constant DEFAULT_SELLER = address(0x2);
    address public constant DEFAULT_ARBITER = address(0x3);

    /**
     * @dev Fuzz test for contract creation with different deposit amounts
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_Creation(uint256 _depositAmount) public {
        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(DEFAULT_BUYER, _depositAmount);

        // Deploy the escrow contract as the buyer
        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: _depositAmount}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Verify contract state
        (address _buyer, address _seller, address _arbiter, uint256 _amount, bool _isConfirmed, bool _isCanceled) =
            escrow.getStatus();

        assertEq(_buyer, DEFAULT_BUYER);
        assertEq(_seller, DEFAULT_SELLER);
        assertEq(_arbiter, DEFAULT_ARBITER);
        assertEq(_amount, _depositAmount);
        assertFalse(_isConfirmed);
        assertFalse(_isCanceled);
    }

    /**
     * @dev Fuzz test for confirming receipt with various deposit amounts
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_ConfirmReceipt(uint256 _depositAmount) public {
        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(DEFAULT_BUYER, _depositAmount);

        // Deploy the escrow contract as the buyer
        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: _depositAmount}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Get the initial seller balance
        uint256 initialSellerBalance = address(DEFAULT_SELLER).balance;

        // Buyer confirms receipt
        vm.prank(DEFAULT_BUYER);
        escrow.confirmReceipt();

        // Check seller received the funds
        assertEq(
            address(DEFAULT_SELLER).balance,
            initialSellerBalance + _depositAmount,
            "Seller should receive the correct deposited amount"
        );

        // Check escrow status
        (,,,, bool _isConfirmed,) = escrow.getStatus();
        assertTrue(_isConfirmed);
    }

    /**
     * @dev Fuzz test for cancellation by the buyer with various deposit amounts
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_CancelByBuyer(uint256 _depositAmount) public {
        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(DEFAULT_BUYER, _depositAmount * 2); // Extra ETH to check balance changes

        // Deploy the escrow contract as the buyer
        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: _depositAmount}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Calculate buyer balance after escrow creation
        uint256 buyerBalanceAfterCreation = address(DEFAULT_BUYER).balance;

        // Buyer cancels escrow
        vm.prank(DEFAULT_BUYER);
        escrow.cancelEscrow();

        // Check escrow status
        (,,,,, bool _isCanceled) = escrow.getStatus();
        assertTrue(_isCanceled);

        // Check buyer received the funds back
        assertEq(
            address(DEFAULT_BUYER).balance,
            buyerBalanceAfterCreation + _depositAmount,
            "Buyer should receive the exact deposited amount back"
        );
    }

    /**
     * @dev Fuzz test for cancellation by the arbiter with various deposit amounts
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_CancelByArbiter(uint256 _depositAmount) public {
        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(DEFAULT_BUYER, _depositAmount);

        // Deploy the escrow contract as the buyer
        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: _depositAmount}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Note buyer balance after escrow creation
        uint256 buyerBalanceAfterCreation = address(DEFAULT_BUYER).balance;

        // Arbiter cancels escrow
        vm.prank(DEFAULT_ARBITER);
        escrow.cancelEscrow();

        // Check escrow status
        (,,,,, bool _isCanceled) = escrow.getStatus();
        assertTrue(_isCanceled);

        // Check buyer received the funds back
        assertEq(
            address(DEFAULT_BUYER).balance,
            buyerBalanceAfterCreation + _depositAmount,
            "Buyer should receive the exact deposited amount back when arbiter cancels"
        );
    }

    /**
     * @dev Fuzz test for various random addresses as participants
     * @param _buyer Random buyer address
     * @param _seller Random seller address
     * @param _arbiter Random arbiter address
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_RandomAddresses(address _buyer, address _seller, address _arbiter, uint256 _depositAmount)
        public
    {
        // Skip if any address is zero address or if addresses are the same
        vm.assume(_buyer != address(0));
        vm.assume(_seller != address(0));
        vm.assume(_arbiter != address(0));
        vm.assume(_buyer != _seller);
        vm.assume(_buyer != _arbiter);
        vm.assume(_seller != _arbiter);

        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(_buyer, _depositAmount);

        // Deploy the escrow contract as the buyer
        vm.prank(_buyer);
        Escrow escrow = new Escrow{value: _depositAmount}(_seller, _arbiter);

        // Verify contract state
        (
            address returnedBuyer,
            address returnedSeller,
            address returnedArbiter,
            uint256 returnedAmount,
            bool _isConfirmed,
            bool _isCanceled
        ) = escrow.getStatus();

        // Check that the contract was initialized correctly with the random addresses
        assertEq(returnedBuyer, _buyer);
        assertEq(returnedSeller, _seller);
        assertEq(returnedArbiter, _arbiter);
        assertEq(returnedAmount, _depositAmount);
        assertFalse(_isConfirmed);
        assertFalse(_isCanceled);
    }

    /**
     * @dev Fuzz test to ensure only the correct actors can perform actions
     * @param _caller Random caller address
     */
    function testFuzz_AccessControl(address _caller) public {
        // Skip if caller is buyer or arbiter (as they should be allowed to call certain functions)
        vm.assume(_caller != DEFAULT_BUYER);
        vm.assume(_caller != DEFAULT_ARBITER);

        // Set up a standard escrow
        vm.deal(DEFAULT_BUYER, 1 ether);

        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: 1 ether}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Random address tries to confirm receipt (should fail)
        vm.prank(_caller);
        vm.expectRevert("Only buyer can call this function");
        escrow.confirmReceipt();

        // Random address tries to cancel (should fail)
        vm.prank(_caller);
        vm.expectRevert("Only buyer or arbiter can cancel");
        escrow.cancelEscrow();
    }

    /**
     * @dev Fuzz test for sequential operations with different participants
     * @param _action Action to take (0: confirm, 1: cancel by buyer, 2: cancel by arbiter)
     * @param _depositAmount The amount to deposit into the escrow
     */
    function testFuzz_SequentialOperations(uint8 _action, uint256 _depositAmount) public {
        // Bound the action to 0-2
        _action = uint8(bound(_action, 0, 2));

        // Bound the deposit amount to prevent overflow and impractical values
        _depositAmount = bound(_depositAmount, 1, 100 ether);

        // Fund the buyer with enough ETH
        vm.deal(DEFAULT_BUYER, _depositAmount);

        // Deploy the escrow contract as the buyer
        vm.prank(DEFAULT_BUYER);
        Escrow escrow = new Escrow{value: _depositAmount}(DEFAULT_SELLER, DEFAULT_ARBITER);

        // Track initial balances
        uint256 initialSellerBalance = address(DEFAULT_SELLER).balance;
        uint256 initialBuyerBalance = address(DEFAULT_BUYER).balance;

        // Perform action based on the fuzzed value
        if (_action == 0) {
            // Confirm receipt
            vm.prank(DEFAULT_BUYER);
            escrow.confirmReceipt();

            // Verify seller received funds
            assertEq(address(DEFAULT_SELLER).balance, initialSellerBalance + _depositAmount);

            // Verify status
            (,,,, bool _isConfirmed,) = escrow.getStatus();
            assertTrue(_isConfirmed);

            // Verify second action fails (try to cancel after confirmation)
            vm.prank(DEFAULT_BUYER);
            vm.expectRevert("Escrow has already been confirmed");
            escrow.cancelEscrow();
        } else if (_action == 1) {
            // Cancel by buyer
            vm.prank(DEFAULT_BUYER);
            escrow.cancelEscrow();

            // Verify buyer received funds back
            assertEq(address(DEFAULT_BUYER).balance, initialBuyerBalance + _depositAmount);

            // Verify status
            (,,,,, bool _isCanceled) = escrow.getStatus();
            assertTrue(_isCanceled);

            // Verify second action fails (try to confirm after cancellation)
            vm.prank(DEFAULT_BUYER);
            vm.expectRevert("Escrow has already been canceled");
            escrow.confirmReceipt();
        } else {
            // Cancel by arbiter
            vm.prank(DEFAULT_ARBITER);
            escrow.cancelEscrow();

            // Verify buyer received funds back
            assertEq(address(DEFAULT_BUYER).balance, initialBuyerBalance + _depositAmount);

            // Verify status
            (,,,,, bool _isCanceled) = escrow.getStatus();
            assertTrue(_isCanceled);
        }
    }
}
