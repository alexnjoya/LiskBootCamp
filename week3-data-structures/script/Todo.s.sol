// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TodoList} from "../src/TodoList.sol";

contract TodoListScript is Script {
    
    TodoList public  todoList;
    
    function setUp() public {}
    
    function run() public {
        vm.startBroadcast();
        
        
        todoList = new  TodoList();
        console.log("TodoList deployed at:", address(todoList));
        
        vm.stopBroadcast();
    }
}