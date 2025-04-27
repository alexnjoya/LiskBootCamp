# Solidity Smart Contract Assignment: LotteryGame

## Overview

In this assignment, you will implement a simple Ethereum-based lottery game where players can register, make guesses, and potentially win ETH prizes. This exercise will help you practice Solidity development fundamentals including:

- State variables and data structures
- Function implementation
- Event handling
- Basic randomness generation
- Testing with Foundry

## Project Structure

```
lottery-game/
├── src/
│   └── LotteryGame.sol       # Main contract implementation
└── test/
    └── LotteryGame.t.sol     # Foundry tests
```

## Assignment Tasks

### 1. Implement the LotteryGame Contract

**Clone the Repository:**
- Clone this repository to your local machine:
    ```
     git clone <repository-url>
     ```

- Move into the project directory:
    ```
    cd <repository-name>
    ```

You need to complete the implementation of the `LotteryGame.sol` contract by filling in all the TODOs:

- Declare state variables for tracking player information, prizes, and winners
- Implement the event declarations
- Complete the `register()` function to allow players to join the game
- Implement the `guessNumber()` function for players to make guesses
- Complete the `distributePrizes()` function to handle prize distribution
- Implement the `getPrevWinners()` function to view previous winners

### 2. Fix the Test File

- Rename all instances of `SampleGame` to `LotteryGame` in the test file
- Ensure the import path correctly points to your implementation
- If needed, implement any additional test cases to ensure full coverage

## Game Rules

1. Players must stake exactly 0.02 ETH to register
2. Each player can make up to 2 guesses
3. Valid guesses are numbers between 1 and 9
4. Players who guess correctly are added to the winners list
5. Prizes are distributed equally among all winners
6. After distribution, the game state is reset for a new round

## Implementation Requirements

### LotteryGame.sol

Your implementation should include:

- A `Player` struct with `attempts` and `active` properties
- Mappings and arrays to track player information and game state
- Events for important game actions
- Functions for registration, guessing, and prize distribution
- A simple random number generator

### Important Notes

- The `_generateRandomNumber()` function is already provided
- This is a simplified implementation that uses block properties for randomness
- For a production environment, a more secure random number generator would be required

## Testing

Run the tests using Foundry:

```bash
forge test
```

Ensure all tests pass before submitting your assignment. The tests verify that:

1. Players can register with the correct amount
2. Registration fails with incorrect amounts
3. Guesses work within valid ranges
4. Unregistered players cannot make guesses
5. Players are limited to two attempts
6. Prizes cannot be distributed when there are no winners

## Evaluation Criteria

Your implementation will be evaluated based on:

1. **Correctness**: All functions work as intended and pass the provided tests
2. **Code Quality**: Clean, well-documented, and efficient code
3. **Security**: Proper validation and error handling
4. **Gas Efficiency**: Optimized operations where possible

## Hints

- Make sure all state variables are appropriately initialized
- Use proper access control for internal functions
- Remember to emit events at the appropriate times
- Consider edge cases in your implementation

## Submission

Submit both your completed `LotteryGame.sol` contract and the fixed test file. Make sure your code compiles without errors and passes all the provided tests.







[⠊] Compiling...
[⠊] Compiling 2 files with Solc 0.8.28
[⠢] Solc 0.8.28 finished in 919.44ms
Compiler run successful!
Script ran successfully.

== Logs ==
  Deploying LotteryGame contract...
  LotteryGame deployed at: 0x414395e9a46775291490Bd659B6bDF6aBA3aC318

## Setting up 1 EVM.

==========================

Chain 4202

Estimated gas price: 0.000000507 gwei

Estimated total gas used for script: 1397279

Estimated amount required: 0.000000000708420453 ETH

==========================

##### 4202
✅  [Success] Hash: 0x3ce4d385a78027e10e234150659288045b433ace1d8ec14c65f9d99a7ed3870c
Contract Address: 0x414395e9a46775291490Bd659B6bDF6aBA3aC318
Block: 20218196
Paid: 0.00000000027300682 ETH (1074830 gas * 0.000000254 gwei)

✅ Sequence #1 on 4202 | Total Paid: 0.00000000027300682 ETH (1074830 gas * avg 0.000000254 gwei)


==========================                                                                                                                               

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.