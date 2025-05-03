// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TodoList.sol";

contract TodoListTest is Test {
    TodoList public todoList;
    
    function setUp() public {
        todoList = new TodoList();
    }
    
    function testAddTodo() public {
        uint id = todoList.addTodo("Buy groceries");
        
        TodoList.Todo memory todo = todoList.getTodo(id);
        
        assertEq(todo.id, 1);
        assertEq(todo.content, "Buy groceries");
        assertEq(uint(todo.status), uint(TodoList.Status.Pending));
        assertEq(todoList.getTodoCount(), 1);
    }
    
    function testUpdateStatus() public {
        uint id = todoList.addTodo("Complete assignment");
        
        todoList.updateStatus(id, TodoList.Status.InProgress);
        TodoList.Todo memory todo = todoList.getTodo(id);
        assertEq(uint(todo.status), uint(TodoList.Status.InProgress));
        
        todoList.updateStatus(id, TodoList.Status.Completed);
        todo = todoList.getTodo(id);
        assertEq(uint(todo.status), uint(TodoList.Status.Completed));
    }
    
    function testGetTodo() public {
        uint id = todoList.addTodo("Learn Solidity");
        
        TodoList.Todo memory todo = todoList.getTodo(id);
        
        assertEq(todo.id, 1);
        assertEq(todo.content, "Learn Solidity");
        assertEq(uint(todo.status), uint(TodoList.Status.Pending));
    }
    
    function testGetTodoCount() public {
        assertEq(todoList.getTodoCount(), 0);
        
        todoList.addTodo("Task 1");
        assertEq(todoList.getTodoCount(), 1);
        
        todoList.addTodo("Task 2");
        assertEq(todoList.getTodoCount(), 2);
    }
    
    function test_RevertWhen_GetNonExistentTodo() public {
        // Expect a revert when trying to get a non-existent todo
        vm.expectRevert("Todo does not exist");
        todoList.getTodo(999);
    }
    
    function test_RevertWhen_UpdateNonExistentTodo() public {
        // Expect a revert when trying to update a non-existent todo
        vm.expectRevert("Todo does not exist");
        todoList.updateStatus(999, TodoList.Status.Completed);
    }
    
    function testMultipleTodos() public {
        uint id1 = todoList.addTodo("First task");
        uint id2 = todoList.addTodo("Second task");
        uint id3 = todoList.addTodo("Third task");
        
        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        
        assertEq(todoList.getTodoCount(), 3);
        
        TodoList.Todo memory todo2 = todoList.getTodo(id2);
        assertEq(todo2.content, "Second task");
    }
}