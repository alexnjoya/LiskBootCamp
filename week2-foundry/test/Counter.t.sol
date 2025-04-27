// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

// Import the Counter contract directly
contract Counter {
    uint256 public count;
    
    // Function to get the current count
    function get() public view returns (uint256) {
        return count;
    }
    
    // Function to increment count by 1
    function inc() public {
        count += 1;
    }
    
    
    function dec() public {
        // Prevent underflow
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
    }
    
    // Function to reset count to zero
    function reset() public {
        count = 0;
    }
}

contract CounterTest is Test {
    Counter public counter;

    // Set up the test environment before each test
    function setUp() public {
        counter = new Counter();
    }

    // Test initial state
    function testInitialState() public view {
        assertEq(counter.count(), 0, "Initial count should be 0");
        assertEq(counter.get(), 0, "Get function should return 0 initially");
    }

    // Test increment function
    function testIncrement() public {
        counter.inc();
        assertEq(counter.count(), 1, "Count should be 1 after one increment");
        
        counter.inc();
        assertEq(counter.count(), 2, "Count should be 2 after two increments");
        
        // Also verify get() returns the same value
        assertEq(counter.get(), 2, "Get function should return current count");
    }

    // Test decrement function
    function testDecrement() public {
        // First increment to avoid underflow
        counter.inc();
        counter.inc();
        assertEq(counter.count(), 2, "Count should be 2 after two increments");
        
        counter.dec();
        assertEq(counter.count(), 1, "Count should be 1 after one decrement");
        
        // Also verify get() returns the same value
        assertEq(counter.get(), 1, "Get function should return current count");
    }

    // Test decrement underflow prevention
    function testDecrementUnderflow() public {
        // Count starts at 0, trying to decrement should revert
        vm.expectRevert("Counter: cannot decrement below zero");
        counter.dec();
    }

    // Test reset function
    function testReset() public {
        // First increment a few times
        counter.inc();
        counter.inc();
        counter.inc();
        assertEq(counter.count(), 3, "Count should be 3 after three increments");
        
        counter.reset();
        assertEq(counter.count(), 0, "Count should be 0 after reset");
    }

    // Test multiple operations in sequence
    function testMixedOperations() public {
        counter.inc();
        counter.inc();
        assertEq(counter.count(), 2, "Count should be 2 after two increments");
        
        counter.dec();
        assertEq(counter.count(), 1, "Count should be 1 after one decrement");
        
        counter.reset();
        assertEq(counter.count(), 0, "Count should be 0 after reset");
        
        counter.inc();
        assertEq(counter.count(), 1, "Count should be 1 after increment post-reset");
    }

    // Fuzz test for multiple increments
    function testFuzzIncrement(uint8 incrementCount) public {
        // Limit to avoid exceeding gas limits
        uint8 boundedCount = incrementCount % 100;
        
        uint256 expectedCount = 0;
        for (uint8 i = 0; i < boundedCount; i++) {
            counter.inc();
            expectedCount++;
        }
        
        assertEq(counter.count(), expectedCount, "Count should match expected value after multiple increments");
    }

    // Fuzz test for increment and decrement operations
    function testFuzzIncrementAndDecrement(uint8 operations, bool[] calldata isIncrement) public {
        // Limit operations to avoid exceeding gas limits
        uint8 boundedOperations = operations % 100;
        
        uint256 expectedCount = 0;
        for (uint8 i = 0; i < boundedOperations && i < isIncrement.length; i++) {
            if (isIncrement[i]) {
                counter.inc();
                expectedCount++;
            } else if (expectedCount > 0) {
                counter.dec();
                expectedCount--;
            }
        }
        
        assertEq(counter.count(), expectedCount, "Count should match expected value after mixed operations");
    }
}