const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TipJar contract to Sepolia testnet...");

  // Get the contract factory
  const TipJar = await hre.ethers.getContractFactory("TipJar");
  
  // Deploy the contract
  const tipJar = await TipJar.deploy();
  
  // Wait for deployment to complete
  await tipJar.waitForDeployment();
  
  const contractAddress = await tipJar.getAddress();
  
  console.log("✅ TipJar contract deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Sepolia Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Verify the contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env file with the contract address:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Update your frontend to use the new contract address");
  console.log("3. Test the contract functionality on Sepolia testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 