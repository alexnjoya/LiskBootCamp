// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title LotteryGame
 * @dev A simple number guessing game where players can win ETH prizes
 */

/**
@title LottteryGame

 */

contract LotteryGame {
    struct Player {
        uint256 attempts;
        bool active;
    }

    // State variables
    mapping(address => Player) public players;
    address[] public playerAddresses;
    uint256 public totalPrize;
    address[] public winners;
    address[] public prevWinners;

    // Events
    event PlayerRegistered(address indexed player, uint256 amount);
    event GuessResult(address indexed player, uint256 guess, bool isCorrect);
    event PrizesDistributed(address[] winners, uint256 amountPerWinner);

    /**
     * @dev Register to play the game
     * Players must stake exactly 0.02 ETH to participate
     */
    function register() public payable {
        require(msg.value == 0.02 ether, "Please stake 0.02 ETH");

        // Add player to mapping
        players[msg.sender] = Player({attempts: 0, active: true});

        // Add player address to array
        playerAddresses.push(msg.sender);

        // Update total prize
        totalPrize += msg.value;

        // Emit registration event
        emit PlayerRegistered(msg.sender, msg.value);
    }

    /**
     * @dev Make a guess between 1 and 9
     * @param guess The player's guess
     */
    function guessNumber(uint256 guess) public {
        // Validate guess is between 1 and 9
        require(guess >= 1 && guess <= 9, "Number must be between 1 and 9");

        // Check player is registered
        require(players[msg.sender].active, "Player is not active");

        // Check player has attempts left
        require(
            players[msg.sender].attempts < 2,
            "Player has already made 2 attempts"
        );

        // Generate "random" number
        uint256 winningNumber = _generateRandomNumber();

        // Update player attempts
        players[msg.sender].attempts += 1;

        // Check if guess is correct
        bool isCorrect = (guess == winningNumber);

        // Handle correct guesses
        if (isCorrect) {
            winners.push(msg.sender);
        }

        // Emit appropriate event
        emit GuessResult(msg.sender, guess, isCorrect);
    }

    /**
     * @dev Distribute prizes to winners
     */
    function distributePrizes() public {
        require(winners.length > 0, "No winners to distribute prizes to");

        // Calculate prize amount per winner
        uint256 prizePerWinner = totalPrize / winners.length;

        // Store winners in previous winners array
        delete prevWinners;
        for (uint256 i = 0; i < winners.length; i++) {
            prevWinners.push(winners[i]);

            // Transfer prizes to winners
            payable(winners[i]).transfer(prizePerWinner);
        }

        // Emit event
        emit PrizesDistributed(winners, prizePerWinner);

        // Reset game state
        _resetGame();
    }

    /**
     * @dev View function to get previous winners
     * @return Array of previous winner addresses
     */
    function getPrevWinners() public view returns (address[] memory) {
        return prevWinners;
    }

    /**
     * @dev Internal function to reset the game state
     */
    function _resetGame() internal {
        // Reset player states
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            delete players[playerAddresses[i]];
        }

        // Clear arrays and reset prize
        delete playerAddresses;
        delete winners;
        totalPrize = 0;
    }

    /**
     * @dev Helper function to generate a "random" number
     * @return A uint between 1 and 9
     * NOTE: This is not secure for production use!
     */
    function _generateRandomNumber() internal view returns (uint256) {
        return
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender
                    )
                )
            ) % 9) + 1;
    }
}
