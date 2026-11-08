import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const RPC_URL = process.env.VITE_BOTCHAIN_RPC_URL || process.env.BOTCHAIN_RPC_URL || 'https://rpc.bohr.life';
const CHAIN_ID = parseInt(process.env.VITE_BOTCHAIN_CHAIN_ID || '968', 10);
const EXPLORER_URL = process.env.VITE_BOTCHAIN_EXPLORER_URL || 'https://scan.bohr.life';

async function main() {
  console.log('--- SubmitProof Smart Contract Deployment ---');
  console.log(`Target Network: Botchain Testnet (Chain ID: ${CHAIN_ID})`);
  console.log(`RPC Endpoint: ${RPC_URL}`);

  // 1. Read Solidity source
  const contractPath = path.resolve(__dirname, '../contracts/AssignmentSubmissionRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  // 2. Compile with solc
  console.log('\nCompiling AssignmentSubmissionRegistry.sol...');
  const input = {
    language: 'Solidity',
    sources: {
      'AssignmentSubmissionRegistry.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      if (error.severity === 'error') {
        console.error('Compilation error:', error.formattedMessage);
        hasError = true;
      } else {
        console.warn('Warning:', error.formattedMessage);
      }
    }
    if (hasError) process.exit(1);
  }

  const contractOutput = output.contracts['AssignmentSubmissionRegistry.sol']['AssignmentSubmissionRegistry'];
  const abi = contractOutput.abi;
  const bytecode = '0x' + contractOutput.evm.bytecode.object;

  console.log('✓ Compilation successful!');

  // Save compiled artifact
  const artifactsDir = path.resolve(__dirname, '../src/contracts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(artifactsDir, 'AssignmentSubmissionRegistry.json'),
    JSON.stringify({ abi, bytecode }, null, 2)
  );
  console.log('✓ Artifact saved to src/contracts/AssignmentSubmissionRegistry.json');

  // 3. Deployment requires a private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('\nℹ️  To deploy on-chain to Botchain Testnet:');
    console.log('   Set your testnet wallet private key:');
    console.log('   $env:PRIVATE_KEY="your-wallet-private-key-here"');
    console.log('   node scripts/deploy.js');
    console.log('\nContract bytecode and ABI are compiled and ready.');
    return;
  }

  // 4. Deploy using ethers
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    name: 'botchain-testnet',
    chainId: CHAIN_ID,
  });

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`\nDeploying from wallet: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Wallet Balance: ${ethers.formatEther(balance)} BOT`);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log('Submitting deployment transaction to Botchain Testnet...');
  
  const contract = await factory.deploy();
  console.log(`Deployment TX sent: ${contract.deploymentTransaction().hash}`);
  console.log(`View on Explorer: ${EXPLORER_URL}/tx/${contract.deploymentTransaction().hash}`);

  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log(`\n🎉 AssignmentSubmissionRegistry deployed successfully!`);
  console.log(`Contract Address: ${deployedAddress}`);
  console.log(`Explorer Link: ${EXPLORER_URL}/address/${deployedAddress}`);

  // Save deployed address
  fs.writeFileSync(
    path.resolve(__dirname, '../src/config/contractAddress.json'),
    JSON.stringify({ address: deployedAddress, chainId: CHAIN_ID, deployedAt: new Date().toISOString() }, null, 2)
  );
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
