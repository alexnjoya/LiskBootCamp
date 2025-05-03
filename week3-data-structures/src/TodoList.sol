// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Todo List Smart Contract
/// @notice A simple contract that manages a todo list
contract TodoList {
    // Status enum to represent the state of a todo
    enum Status {
        Pending,
        InProgress,
        Completed
    }

    // Todo struct that holds todo information
    struct Todo {
        uint id;
        string content;
        Status status;
    }

    // Mapping from todo ID to Todo struct
    mapping(uint => Todo) public todos;

    // Array to keep track of all todo IDs
    uint[] public todoIds;

    // Counter to assign unique IDs to todos
    uint private nextId = 1;

    // Events
    event TodoAdded(uint id, string content);
    event TodoStatusUpdated(uint id, Status status);

    /// @notice Adds a new todo to the list
    /// @param _content The content/description of the todo
    /// @return The ID of the newly created todo
    function addTodo(string memory _content) public returns (uint) {
        uint id = nextId;

        todos[id] = Todo({id: id, content: _content, status: Status.Pending});

        todoIds.push(id);
        nextId++;

        emit TodoAdded(id, _content);

        return id;
    }

    /// @notice Updates the status of an existing todo
    /// @param _id The ID of the todo to update
    /// @param _status The new status to set
    function updateStatus(uint _id, Status _status) public {
        // Check that the todo exists
        require(todoExists(_id), "Todo does not exist");

        todos[_id].status = _status;

        emit TodoStatusUpdated(_id, _status);
    }

    /// @notice Retrieves a specific todo by ID
    /// @param _id The ID of the todo to retrieve
    /// @return The todo struct containing id, content, and status
    function getTodo(uint _id) public view returns (Todo memory) {
        require(todoExists(_id), "Todo does not exist");
        return todos[_id];
    }

    /// @notice Gets the total number of todos
    /// @return The number of todos in the list
    function getTodoCount() public view returns (uint) {
        return todoIds.length;
    }

    /// @notice Checks if a todo with the given ID exists
    /// @param _id The ID to check
    /// @return True if the todo exists, false otherwise
    function todoExists(uint _id) internal view returns (bool) {
        // Check if ID is valid and the todo's content is not empty
        return _id > 0 && _id < nextId && bytes(todos[_id].content).length > 0;
    }
}
