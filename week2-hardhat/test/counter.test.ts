import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("Counter", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployCounterFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const Counter = await hre.ethers.getContractFactory("Counter");
      const counter = await Counter.deploy();
  
      return { counter, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("Should initialize with count of 0", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        expect(await counter.count()).to.equal(0);
      });
    });
  
    describe("Functionality", function () {
      it("Should return the current count via get function", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        expect(await counter.get()).to.equal(0);
      });
  
      it("Should increment the count", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        await counter.inc();
        expect(await counter.count()).to.equal(1);
        
        await counter.inc();
        expect(await counter.count()).to.equal(2);
      });
  
      it("Should decrement the count", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        // First increment to make sure we can decrement
        await counter.inc();
        await counter.inc();
        expect(await counter.count()).to.equal(2);
        
        await counter.dec();
        expect(await counter.count()).to.equal(1);
      });
  
      it("Should revert when decrementing below zero", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        // Count starts at 0, so decrementing should fail
        await expect(counter.dec()).to.be.revertedWith(
          "Counter: cannot decrement below zero"
        );
      });
  
      it("Should reset the count to zero", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        // First increment to make sure reset does something
        await counter.inc();
        await counter.inc();
        expect(await counter.count()).to.equal(2);
        
        await counter.reset();
        expect(await counter.count()).to.equal(0);
      });
    });
  
    describe("Multiple Transactions", function () {
      it("Should handle a sequence of operations", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
  
        await counter.inc();
        await counter.inc();
        await counter.inc();
        expect(await counter.count()).to.equal(3);
        
        await counter.dec();
        expect(await counter.count()).to.equal(2);
        
        await counter.reset();
        expect(await counter.count()).to.equal(0);
      });
    });
  
    describe("Access Control", function () {
      it("Should allow any account to interact with the contract", async function () {
        const { counter, otherAccount } = await loadFixture(deployCounterFixture);
  
        // Connect with another account and try operations
        await counter.connect(otherAccount).inc();
        expect(await counter.count()).to.equal(1);
        
        await counter.connect(otherAccount).dec();
        expect(await counter.count()).to.equal(0);
      });
    });
  });