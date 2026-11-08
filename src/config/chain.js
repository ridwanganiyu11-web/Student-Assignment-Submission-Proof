import { defineChain } from 'viem';
import contractArtifact from '../contracts/AssignmentSubmissionRegistry.json';

// Botchain / Bohr Testnet Configuration
export const botchainTestnet = defineChain({
  id: 968,
  name: 'Botchain Testnet',
  network: 'botchain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

export const BOTCHAIN_CHAIN_ID = 968;
export const BOTCHAIN_RPC_URL = 'https://rpc.bohr.life';
export const BOTCHAIN_EXPLORER_URL = 'https://scan.bohr.life';
export const BOTCHAIN_CURRENCY = 'BOT';
export const BOTCHAIN_TOTAL_SUPPLY = '150 Million BOT';

// Reown AppKit Project ID from .env or fallback
export const REOWN_PROJECT_ID = 
  import.meta.env.VITE_REOWN_PROJECT_ID || 'c3b8895055da341ceb6eb934e837aa96';

// Export compiled ABI and Bytecode directly from the artifact
export const CONTRACT_ABI = contractArtifact.abi;
export const CONTRACT_BYTECODE = contractArtifact.bytecode;

// Deployed contract address on Botchain Testnet
export const CONTRACT_ADDRESS = 
  import.meta.env.VITE_CONTRACT_ADDRESS || 
  '0xD4B8b342E8C87F4225119DCbd34FF7fD73C39950';
