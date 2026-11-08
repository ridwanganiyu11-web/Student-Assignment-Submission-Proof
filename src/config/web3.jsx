import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { botchainTestnet, REOWN_PROJECT_ID } from './chain';

// Setup TanStack Query Client
export const queryClient = new QueryClient();

// Setup Wagmi Adapter for Botchain Testnet (Chain ID 968)
export const wagmiAdapter = new WagmiAdapter({
  networks: [botchainTestnet],
  projectId: REOWN_PROJECT_ID,
  ssr: false,
});

// Create Reown AppKit Modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainTestnet],
  projectId: REOWN_PROJECT_ID,
  defaultNetwork: botchainTestnet,
  metadata: {
    name: 'SubmitProof',
    description: 'Submit with Proof. Verify with Confidence on Botchain.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://submitproof.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#2563eb',
    '--w3m-border-radius-master': '10px',
  },
  features: {
    analytics: false,
  },
});

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

