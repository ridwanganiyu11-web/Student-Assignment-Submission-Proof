import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
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
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const RPC_URL = process.env.VITE_BOTCHAIN_RPC_URL || 'https://rpc.bohr.life';
const CHAIN_ID = 968;
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;

async function main() {
  console.log('Testing live on-chain connection to Botchain Testnet...');
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    name: 'botchain-testnet',
    chainId: CHAIN_ID,
  });

  const artifact = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../src/contracts/AssignmentSubmissionRegistry.json'), 'utf8')
  );

  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, provider);

  // 1. Read contract counts
  const counts = await contract.getCounts();
  console.log(`\n✓ On-chain Query Successful!`);
  console.log(`  Total Submissions on-chain: ${counts[0].toString()}`);
  console.log(`  Total Assignments on-chain: ${counts[1].toString()}`);

  // 2. Perform test transaction using the deployer wallet
  if (process.env.PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractWithSigner = contract.connect(wallet);

    console.log(`\nBroadcasting test on-chain assignment creation from ${wallet.address}...`);
    const futureDeadline = Math.floor(Date.now() / 1000) + 86400 * 7;
    const tx = await contractWithSigner.createAssignment(
      'Introduction to Computer Science',
      'CS-101',
      'Final Algorithm Analysis Term Project',
      futureDeadline
    );
    console.log(`TX Hash: ${tx.hash}`);
    console.log(`Waiting for block confirmation...`);
    await tx.wait();
    console.log(`✓ Assignment confirmed on-chain!`);

    // Also register a test student submission proof on-chain
    console.log(`\nRegistering sample assignment submission proof on-chain...`);
    const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('CS101_Student_Assignment_V1'));
    const subTx = await contractWithSigner.registerAssignmentSubmission(
      1,
      sampleHash,
      0
    );
    console.log(`Submission TX Hash: ${subTx.hash}`);
    await subTx.wait();
    console.log(`✓ Submission proof confirmed on-chain!`);

    const updatedCounts = await contract.getCounts();
    console.log(`\nUpdated On-Chain State:`);
    console.log(`  Total Submissions: ${updatedCounts[0].toString()}`);
    console.log(`  Total Assignments: ${updatedCounts[1].toString()}`);
  }
}

main().catch(console.error);
