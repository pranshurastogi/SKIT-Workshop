import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'wagmi'

// WalletConnect Project ID - get one free at https://cloud.walletconnect.com
// For development, you can use a placeholder, but it's recommended to get your own
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c8e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'

// Alchemy RPC URL from environment (.env.local)
// IMPORTANT: Must use NEXT_PUBLIC_ prefix for client-side access
// Supports full RPC URL or API key
const alchemyRpcUrl = 
  process.env.NEXT_PUBLIC_ALCHEMY_RPC || 
  (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY 
    ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : undefined)

console.log('[wagmi] RPC Configuration:', {
  hasRpcUrl: !!alchemyRpcUrl,
  rpcUrl: alchemyRpcUrl ? `${alchemyRpcUrl.substring(0, 30)}...` : 'not set',
})

export const config = getDefaultConfig({
  appName: 'ChronoVault',
  projectId: walletConnectProjectId,
  chains: [sepolia],
  ssr: true,
  transports: {
    [sepolia.id]: alchemyRpcUrl ? http(alchemyRpcUrl) : http(),
  },
})

