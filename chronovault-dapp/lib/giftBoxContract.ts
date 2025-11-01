import { sepolia } from 'wagmi/chains'
import GiftBoxABI from '@/contracts/giftBox.json'

// Contract address - hardcoded as provided
export const GIFTBOX_CONTRACT_ADDRESS = '0x8D05dA559A196e715D36E2020E6288f9184C2750' as `0x${string}`

// Chain configuration
export const CHAIN = sepolia

// ABI (Application Binary Interface)
export const GIFTBOX_ABI = GiftBoxABI as any

