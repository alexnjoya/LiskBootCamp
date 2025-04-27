import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // ✅ Correct way to get balance in ethers.js v6+
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  const Counter = await ethers.getContractFactory("Counter");
  console.log("Deploying Counter...");
  
  const counter = await Counter.deploy();
  
  // ✅ Wait for deployment transaction to be mined
  await counter.waitForDeployment(); // New in ethers.js v6+
  
  console.log("Counter deployed to:", await counter.getAddress()); // ✅ Use getAddress()
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });