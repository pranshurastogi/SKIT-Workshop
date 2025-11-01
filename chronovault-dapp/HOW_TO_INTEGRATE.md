# How to Integrate GiftBox Smart Contract - Complete Beginner Guide

This guide will walk you through every step needed to integrate the GiftBox smart contract into your ChronoVault frontend application. We'll assume you're starting from scratch and explain everything in detail.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Getting API Keys](#getting-api-keys)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Deploying the Smart Contract](#deploying-the-smart-contract)
6. [Generating Contract ABI](#generating-contract-abi)
7. [Setting Up Contract Configuration](#setting-up-contract-configuration)
8. [Creating Contract Hooks](#creating-contract-hooks)
9. [Updating the UI Components](#updating-the-ui-components)
10. [Testing Your Integration](#testing-your-integration)
11. [Troubleshooting](#troubleshooting)
12. [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. Node.js and npm/pnpm/yarn

**What is Node.js?** Node.js is a JavaScript runtime that allows you to run JavaScript on your computer. npm, pnpm, and yarn are package managers that help you install JavaScript libraries.

**How to check if you have it:**
- Open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows)
- Type: `node --version`
- If you see a version number (like `v20.10.0`), you're good!
- If you see an error, you need to install Node.js

**How to install Node.js:**
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the "LTS" (Long Term Support) version
3. Run the installer and follow the instructions
4. Restart your terminal and verify with `node --version`

**Package Manager:**
This project uses `pnpm`. Install it globally:
```bash
npm install -g pnpm
```

Or use `npm` or `yarn` if you prefer (just replace `pnpm` commands with `npm` or `yarn`).

### 2. Git (Optional but Recommended)

**What is Git?** Git is a version control system that helps you track changes to your code.

**How to check if you have it:**
- Open terminal and type: `git --version`
- If you see a version, you're set!

**How to install Git:**
- Mac: Usually comes pre-installed, or download from [https://git-scm.com/](https://git-scm.com/)
- Windows: Download from [https://git-scm.com/](https://git-scm.com/)

### 3. Code Editor

We recommend using **Visual Studio Code** (VS Code):
- Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Install helpful extensions:
  - **Solidity** (for smart contract syntax highlighting)
  - **ES7+ React/Redux/React-Native snippets**
  - **Prettier** (code formatter)

### 4. Web Browser with Crypto Wallet Extension

You'll need a crypto wallet to interact with the blockchain:

**MetaMask** (Most Popular):
1. Install the browser extension:
   - Chrome: [https://chrome.google.com/webstore/detail/metamask](https://chrome.google.com/webstore/detail/metamask)
   - Firefox: [https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
   - Brave: Built-in wallet or install extension

2. Create a new wallet (for testing purposes):
   - Click the MetaMask extension icon
   - Follow the setup wizard
   - **IMPORTANT**: Save your seed phrase in a safe place (never share it!)

3. Add Sepolia Test Network:
   - Click the network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add network" or "Show test networks"
   - Search for "Sepolia" and add it
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY` (you'll get this later)
   - Chain ID: 11155111
   - Currency Symbol: ETH
   - Block Explorer: `https://sepolia.etherscan.io`

4. Get Test ETH:
   - Go to [https://sepoliafaucet.com/](https://sepoliafaucet.com/) or [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia)
   - Enter your wallet address
   - Request test ETH (you'll get some for free to test)

---

## Installation

### Step 1: Navigate to Your Project Directory

Open your terminal and navigate to where your project is located:

```bash
cd /Users/pranshurastogi/Documents/Hackathons-Grants/SKIT/chronovault-dapp
```

### Step 2: Install Dependencies

Install all the required packages for the project:

```bash
pnpm install
```

**What does this do?** This command reads the `package.json` file and installs all the libraries your project needs (like React, wagmi, etc.). This may take a few minutes the first time.

**If you get errors:**
- Make sure you're in the correct directory
- Try deleting `node_modules` folder (if it exists) and `pnpm-lock.yaml`, then run `pnpm install` again
- Make sure Node.js is installed correctly

### Step 3: Verify Installation

Run the development server to make sure everything is set up correctly:

```bash
pnpm dev
```

**What does this do?** This starts a local development server. You should see:
- A message like "Ready on http://localhost:3000"
- Open your browser and go to `http://localhost:3000`
- You should see the ChronoVault interface

**To stop the server:** Press `Ctrl + C` in the terminal

---

## Getting API Keys

### 1. WalletConnect Project ID (Required)

**What is WalletConnect?** WalletConnect allows users to connect their mobile wallets or other wallet types to your dApp. It's free to use.

**How to get a WalletConnect Project ID:**

1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Click "Sign In" or "Get Started"
3. Sign in with your GitHub, Google, or email account
4. Click "Create New Project" or "New Project"
5. Fill in the project details:
   - Project Name: "ChronoVault" (or any name you like)
   - Homepage URL: `http://localhost:3000` (for development)
   - Allowed Domains: `localhost` (for development)
6. Click "Create"
7. Copy your **Project ID** (it looks like: `abc123def456ghi789jkl012mno345pq`)
8. **Save this Project ID** - you'll need it in the next section

**Important Notes:**
- The Project ID is free
- You can use the same Project ID for both development and production (just update allowed domains)
- If you lose it, you can always create a new project

### 2. RPC Provider (Optional but Recommended)

**What is an RPC Provider?** RPC (Remote Procedure Call) providers help your dApp communicate with the blockchain. While public RPCs exist, having your own API key gives you:
- Better rate limits
- More reliable connections
- Analytics

**Free Options:**

**Option A: Infura (Recommended for Beginners)**
1. Go to [https://www.infura.io/](https://www.infura.io/)
2. Click "Get Started" or "Sign Up"
3. Create an account (free)
4. Once logged in, click "Create New Key"
5. Name it "ChronoVault" (or any name)
6. Select "Web3 API" as the product
7. Choose "Sepolia" network
8. Click "Create"
9. Copy your **API Key** (looks like: `abc123def456ghi789jkl012`)
10. Your RPC URL will be: `https://sepolia.infura.io/v3/YOUR_API_KEY`

**Option B: Alchemy**
1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Click "Sign Up" (free)
3. Create an account
4. Click "Create App" or "Create New App"
5. Name: "ChronoVault"
6. Chain: Ethereum
7. Network: Sepolia
8. Click "Create App"
9. Click on your app to view details
10. Copy your **API Key**
11. Your RPC URL will be: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**Note:** If you don't want to set up a custom RPC provider right now, you can skip this step. The app will use public RPC endpoints, which may be slower or less reliable.

### 3. IPFS Provider (Optional - for Message Storage)

**What is IPFS?** IPFS (InterPlanetary File System) is a decentralized storage system. The GiftBox contract stores encrypted message URIs (like `ipfs://...`), so you might want to set up IPFS.

**Free Option: Pinata**
1. Go to [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. Sign up for a free account
3. Once logged in, go to "API Keys"
4. Click "New Key"
5. Name it "ChronoVault"
6. Give it permissions: "PinFileToIPFS", "PinJSONToIPFS"
7. Copy your **JWT Token**
8. **Note:** This is optional for now - you can add IPFS integration later

---

## Environment Variables Setup

**What are environment variables?** Environment variables are secret values (like API keys) that you don't want to commit to your code repository. They're stored in a `.env.local` file.

### Step 1: Create Environment File

In your project root directory, create a file named `.env.local`:

```bash
# In your project root: /Users/pranshurastogi/Documents/Hackathons-Grants/SKIT/chronovault-dapp/.env.local
```

### Step 2: Add Your Environment Variables

Open `.env.local` in your code editor and add the following:

```env
# WalletConnect Project ID (Required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Custom RPC Provider (Optional - if you set one up)
# NEXT_PUBLIC_INFURA_API_KEY=your_infura_key_here
# Or
# NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here

# Contract Address (You'll get this after deploying)
NEXT_PUBLIC_CONTRACT_ADDRESS=

# IPFS Pinata JWT (Optional - for later)
# NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
```

**Replace the values:**
- `your_walletconnect_project_id_here` → Your actual WalletConnect Project ID from earlier

### Step 3: Update wagmi.ts Configuration (If Using Custom RPC)

If you set up Infura or Alchemy, update `lib/wagmi.ts`:

**For Infura:**
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c8e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY

export const config = getDefaultConfig({
  appName: 'ChronoVault',
  projectId: walletConnectProjectId,
  chains: [sepolia],
  ssr: true,
  ...(infuraApiKey && {
    transports: {
      [sepolia.id]: http(`https://sepolia.infura.io/v3/${infuraApiKey}`),
    },
  }),
})
```

**For Alchemy:**
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c8e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = getDefaultConfig({
  appName: 'ChronoVault',
  projectId: walletConnectProjectId,
  chains: [sepolia],
  ssr: true,
  ...(alchemyApiKey && {
    transports: {
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    },
  }),
})
```

**Important Notes:**
- Never commit `.env.local` to Git (it should already be in `.gitignore`)
- Restart your development server after creating/updating `.env.local`
- Make sure variable names start with `NEXT_PUBLIC_` for client-side access

### Step 4: Verify Environment Variables

Restart your dev server and check the browser console - you shouldn't see any errors about missing environment variables.

---

## Deploying the Smart Contract

**What is contract deployment?** Deploying a contract means putting your smart contract code on the blockchain so it can be used.

### Option 1: Using Remix IDE (Easiest for Beginners)

1. **Go to Remix:**
   - Visit [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. **Install OpenZeppelin Contracts:**
   - In the file explorer, right-click on "contracts"
   - Click "New Folder" and name it "lib"
   - Open terminal in Remix (Terminal tab at bottom)
   - Run: `cd lib && npm install @openzeppelin/contracts`

3. **Create Contract File:**
   - In Remix, create a new file: `contracts/GiftBox.sol`
   - Copy the entire GiftBox contract code into this file

4. **Compile the Contract:**
   - Go to "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.24` (or latest 0.8.x)
   - Click "Compile GiftBox.sol"
   - Wait for green checkmark ✅

5. **Deploy the Contract:**
   - Go to "Deploy & Run Transactions" tab
   - Under "Environment", select "Injected Provider - MetaMask"
   - This will connect MetaMask to Remix
   - Make sure you're on Sepolia network in MetaMask
   - Click "Deploy"
   - Confirm the transaction in MetaMask
   - Wait for deployment (can take 10-30 seconds)

6. **Get Contract Address:**
   - After deployment, you'll see "GiftBox" under "Deployed Contracts"
   - Click the copy icon next to the contract address
   - **Save this address** - you'll need it!

7. **Verify the Deployment:**
   - Go to [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
   - Paste your contract address in the search box
   - You should see your contract!

### Option 2: Using Hardhat (Advanced - More Control)

1. **Install Hardhat:**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Initialize Hardhat:**
   ```bash
   npx hardhat init
   ```
   - Choose "Create a JavaScript project"
   - Accept defaults

3. **Install Dependencies:**
   ```bash
   npm install --save-dev @openzeppelin/contracts
   ```

4. **Create Contract:**
   - Create `contracts/GiftBox.sol` with your contract code

5. **Update hardhat.config.js:**
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.8.24",
     networks: {
       sepolia: {
         url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

6. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### Step 3: Update Environment Variable

After deployment, update your `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
```

Replace `0xYourDeployedContractAddressHere` with the actual contract address you copied.

---

## Generating Contract ABI

**What is an ABI?** ABI (Application Binary Interface) is a JSON file that describes how to interact with your smart contract. It tells your frontend what functions exist and how to call them.

### Step 1: Get ABI from Remix (If Using Remix)

1. In Remix, after compilation, go to "Solidity Compiler" tab
2. Look for "ABI" button (blue button with JSON icon)
3. Click "ABI" - it will copy to clipboard
4. Save it to a file in your project

### Step 2: Create ABI File in Your Project

1. Create a new directory: `contracts/` in your project root
2. Create file: `contracts/giftBox.json`
3. Paste the ABI JSON into this file

**File structure should look like:**
```
chronovault-dapp/
  ├── contracts/
  │   └── giftBox.json
  └── ...
```

**Note:** The ABI is a JSON array that looks something like:
```json
[
  {
    "inputs": [...],
    "name": "createEthGift",
    "outputs": [...],
    "stateMutability": "payable",
    "type": "function"
  },
  ...
]
```

### Step 3: Verify ABI Structure

Your ABI should contain at least these functions:
- `createEthGift`
- `createErc20Gift`
- `claim`
- `getGift`
- `nextGiftId` (if you want to read it)

---

## Setting Up Contract Configuration

Now we'll create a configuration file that tells your app where the contract is and how to interact with it.

### Step 1: Create Contract Config File

Create a new file: `lib/giftBoxContract.ts`

```typescript
import { sepolia } from 'wagmi/chains'

// Contract address from environment variable
export const GIFTBOX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// Chain configuration
export const CHAIN = sepolia

// Verify contract address is set
if (!GIFTBOX_CONTRACT_ADDRESS) {
  console.warn('⚠️ NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables')
}
```

### Step 2: Import ABI

Update `lib/giftBoxContract.ts` to import the ABI:

```typescript
import { sepolia } from 'wagmi/chains'
import GiftBoxABI from '@/contracts/giftBox.json'

// Contract address from environment variable
export const GIFTBOX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// Chain configuration
export const CHAIN = sepolia

// ABI (Application Binary Interface)
export const GIFTBOX_ABI = GiftBoxABI

// Verify contract address is set
if (!GIFTBOX_CONTRACT_ADDRESS) {
  console.warn('⚠️ NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables')
}
```

**Note:** If you get TypeScript errors about JSON imports, you may need to update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    ...
  }
}
```

---

## Creating Contract Hooks

**What are hooks?** Hooks are React functions that let you easily interact with your smart contract using wagmi.

### Step 1: Create Hooks File

Create: `hooks/useGiftBox.ts`

```typescript
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
import { parseEther, formatEther } from 'viem'
import { toast } from 'sonner'

/**
 * Hook to create an ETH gift
 */
export function useCreateEthGift() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createEthGift = async (
    recipient: string,
    unlockTime: number,
    encryptedMessageURI: string,
    ethAmount: string
  ) => {
    try {
      // Convert ETH amount to Wei (the smallest unit of ETH)
      const amountInWei = parseEther(ethAmount)

      // Call the smart contract
      writeContract({
        address: GIFTBOX_CONTRACT_ADDRESS,
        abi: GIFTBOX_ABI,
        functionName: 'createEthGift',
        args: [recipient as `0x${string}`, BigInt(unlockTime), encryptedMessageURI],
        value: amountInWei,
      })

      return { hash, isPending, isConfirming, isSuccess, error }
    } catch (err) {
      console.error('Error creating ETH gift:', err)
      toast.error('Failed to create gift')
      return { hash: undefined, isPending: false, isConfirming: false, isSuccess: false, error: err }
    }
  }

  return {
    createEthGift,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to create an ERC-20 gift
 */
export function useCreateErc20Gift() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createErc20Gift = async (
    recipient: string,
    unlockTime: number,
    tokenAddress: string,
    amount: string,
    decimals: number,
    encryptedMessageURI: string
  ) => {
    try {
      // Convert token amount to smallest unit (considering decimals)
      const amountInWei = parseUnits(amount, decimals)

      writeContract({
        address: GIFTBOX_CONTRACT_ADDRESS,
        abi: GIFTBOX_ABI,
        functionName: 'createErc20Gift',
        args: [
          recipient as `0x${string}`,
          BigInt(unlockTime),
          tokenAddress as `0x${string}`,
          amountInWei,
          encryptedMessageURI,
        ],
      })

      return { hash, isPending, isConfirming, isSuccess, error }
    } catch (err) {
      console.error('Error creating ERC-20 gift:', err)
      toast.error('Failed to create gift')
      return { hash: undefined, isPending: false, isConfirming: false, isSuccess: false, error: err }
    }
  }

  return {
    createErc20Gift,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to claim a gift
 */
export function useClaimGift() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const claimGift = async (giftId: number) => {
    try {
      writeContract({
        address: GIFTBOX_CONTRACT_ADDRESS,
        abi: GIFTBOX_ABI,
        functionName: 'claim',
        args: [BigInt(giftId)],
      })

      return { hash, isPending, isConfirming, isSuccess, error }
    } catch (err) {
      console.error('Error claiming gift:', err)
      toast.error('Failed to claim gift')
      return { hash: undefined, isPending: false, isConfirming: false, isSuccess: false, error: err }
    }
  }

  return {
    claimGift,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to get a single gift by ID
 */
export function useGetGift(giftId: number | null) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: giftId !== null ? [BigInt(giftId)] : undefined,
    query: {
      enabled: giftId !== null,
    },
  })

  return {
    gift: data as Gift | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get the next gift ID (total number of gifts)
 */
export function useNextGiftId() {
  const { data, isLoading, error } = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'nextGiftId',
  })

  return {
    nextGiftId: data ? Number(data) : 0,
    isLoading,
    error,
  }
}

// TypeScript types matching the contract
export interface Gift {
  sender: `0x${string}`
  recipient: `0x${string}`
  unlockTime: bigint
  assetType: number // 0 = NATIVE, 1 = ERC20
  token: `0x${string}`
  amount: bigint
  encryptedMessageURI: string
  claimed: boolean
}
```

**Add missing import at top:**
```typescript
import { parseUnits } from 'viem'
```

### Step 2: Create Helper Function to Fetch All Gifts

Since the contract doesn't have a function to get all gifts, we'll need to fetch them one by one. Create a helper:

```typescript
// Add this to hooks/useGiftBox.ts or create a new file hooks/useAllGifts.ts

import { useNextGiftId, useGetGift } from './useGiftBox'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export function useAllGiftsForRecipient() {
  const { address } = useAccount()
  const { nextGiftId } = useNextGiftId()
  const [gifts, setGifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGifts = async () => {
      if (!address || nextGiftId === 0) {
        setGifts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const allGifts: any[] = []

      // Fetch all gifts and filter by recipient
      for (let i = 0; i < nextGiftId; i++) {
        try {
          // You'll need to implement a way to read each gift
          // This is a simplified version - you may need to adjust
          const response = await fetch(`/api/gift/${i}`) // Or use direct contract call
          // ... implementation details
        } catch (error) {
          console.error(`Error fetching gift ${i}:`, error)
        }
      }

      // Filter gifts for current user
      const userGifts = allGifts.filter(
        (gift) => gift?.recipient?.toLowerCase() === address?.toLowerCase() && !gift.claimed
      )

      setGifts(userGifts)
      setLoading(false)
    }

    fetchGifts()
  }, [address, nextGiftId])

  return { gifts, loading }
}
```

**Better approach:** Since reading multiple gifts can be expensive, you might want to create a backend API or use an indexer. For now, let's create a simpler version that reads gifts sequentially using wagmi's multicall (if available) or individual reads.

---

## Updating the UI Components

Now let's update your `app/page.tsx` to use the real contract hooks instead of mock functions.

### Step 1: Update Imports

At the top of `app/page.tsx`, add:

```typescript
import { useCreateEthGift, useClaimGift, useGetGift, useNextGiftId, Gift } from '@/hooks/useGiftBox'
import { useAccount, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
```

### Step 2: Update State Management

Replace the mock gifts state with real contract data:

```typescript
// Remove or update the mock gifts state
// const [receivedGifts] = useState([...]) // Remove this

// Add these new states
const [allGiftIds, setAllGiftIds] = useState<number[]>([])
const { nextGiftId } = useNextGiftId()
const { address } = useAccount()
```

### Step 3: Update createGiftBox Function

Replace the mock `createGiftBox` function:

```typescript
const { createEthGift, isPending: isCreating, isSuccess: createSuccess } = useCreateEthGift()

const createGiftBox = async () => {
  // Validation
  if (!recipientAddress || !ethAmount || !unlockDateTime) {
    toast.error('Please fill in all fields')
    return
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
    toast.error('Invalid recipient address')
    return
  }

  // Validate amount
  const amount = parseFloat(ethAmount)
  if (isNaN(amount) || amount <= 0) {
    toast.error('Invalid ETH amount')
    return
  }

  // Convert datetime to Unix timestamp
  const unlockDate = new Date(unlockDateTime)
  const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000)

  // Check if unlock time is in the future
  if (unlockTimestamp <= Math.floor(Date.now() / 1000)) {
    toast.error('Unlock time must be in the future')
    return
  }

  // For now, we'll use a simple encrypted message URI
  // In production, you'd encrypt the message and upload to IPFS
  const encryptedMessageURI = `ipfs://placeholder-${Date.now()}` // Replace with actual encryption/IPFS

  try {
    await createEthGift(recipientAddress, unlockTimestamp, encryptedMessageURI, ethAmount)
    
    // Show success message
    toast.success('Gift box created! Transaction submitted.')
    
    // Reset form
    setRecipientAddress('')
    setEthAmount('')
    setMessage('')
    setUnlockDateTime('')
  } catch (error) {
    console.error('Error creating gift:', error)
    toast.error('Failed to create gift box')
  }
}
```

### Step 4: Update claimGift Function

Replace the mock `claimGift` function:

```typescript
const { claimGift: claimGiftContract, isPending: isClaiming } = useClaimGift()

const claimGift = async (giftId: number) => {
  try {
    await claimGiftContract(giftId)
    toast.success('Gift claimed successfully!')
    // Refresh gifts list
    // You might want to refetch gifts here
  } catch (error) {
    console.error('Error claiming gift:', error)
    toast.error('Failed to claim gift')
  }
}
```

### Step 5: Fetch User's Gifts

Add a function to fetch all gifts for the connected user:

```typescript
// Add this function to fetch gifts
useEffect(() => {
  const fetchUserGifts = async () => {
    if (!address || nextGiftId === 0) {
      setAllGiftIds([])
      return
    }

    // Create contract read requests for all gifts
    const contracts = []
    for (let i = 0; i < nextGiftId; i++) {
      contracts.push({
        address: GIFTBOX_CONTRACT_ADDRESS,
        abi: GIFTBOX_ABI,
        functionName: 'getGift',
        args: [BigInt(i)],
      })
    }

    // Use wagmi's useReadContracts hook (you'll need to handle this properly)
    // For now, let's create a simpler approach
  }

  fetchUserGifts()
}, [address, nextGiftId])
```

**Simpler approach - Create a custom hook:**

Create `hooks/useUserGifts.ts`:

```typescript
import { useAccount } from 'wagmi'
import { useReadContracts } from 'wagmi'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
import { useNextGiftId } from './useGiftBox'
import { useMemo } from 'react'
import { formatEther } from 'viem'

export function useUserGifts() {
  const { address } = useAccount()
  const { nextGiftId } = useNextGiftId()

  // Create contract read requests for all gifts
  const contracts = useMemo(() => {
    if (nextGiftId === 0) return []
    
    return Array.from({ length: nextGiftId }, (_, i) => ({
      address: GIFTBOX_CONTRACT_ADDRESS,
      abi: GIFTBOX_ABI,
      functionName: 'getGift' as const,
      args: [BigInt(i)],
    }))
  }, [nextGiftId])

  const { data, isLoading, error } = useReadContracts({
    contracts,
  })

  // Filter gifts for current user
  const userGifts = useMemo(() => {
    if (!data || !address) return []

    return data
      .map((result, index) => {
        if (!result.data) return null

        const gift = result.data as any
        const isRecipient = gift.recipient?.toLowerCase() === address?.toLowerCase()

        if (!isRecipient || gift.claimed) return null

        return {
          id: index,
          sender: gift.sender,
          recipient: gift.recipient,
          amount: formatEther(gift.amount),
          unlockTime: Number(gift.unlockTime) * 1000, // Convert to milliseconds
          encryptedMessageURI: gift.encryptedMessageURI,
          claimed: gift.claimed,
          assetType: gift.assetType,
          token: gift.token,
        }
      })
      .filter((gift) => gift !== null)
  }, [data, address])

  return {
    gifts: userGifts,
    isLoading,
    error,
  }
}
```

Then in `app/page.tsx`, use it:

```typescript
import { useUserGifts } from '@/hooks/useUserGifts'

// Inside component:
const { gifts: receivedGifts, isLoading: isLoadingGifts } = useUserGifts()
```

### Step 6: Update the UI to Show Transaction States

Update the "Create Gift Box" button:

```typescript
<Button 
  onClick={createGiftBox} 
  className="w-full gap-2 h-12 text-base" 
  size="lg"
  disabled={isCreating || isConfirming}
>
  {isCreating || isConfirming ? (
    <>
      <Spinner className="h-5 w-5" />
      {isCreating ? 'Creating...' : 'Confirming...'}
    </>
  ) : (
    <>
      <Gift className="h-5 w-5" />
      Create Gift Box
    </>
  )}
</Button>
```

Update the claim button similarly:

```typescript
<Button
  onClick={() => claimGift(gift.id)}
  disabled={!isUnlocked || gift.claimed || isClaiming}
  variant={isUnlocked ? "default" : "secondary"}
  className="h-10"
>
  {isClaiming ? "Claiming..." : gift.claimed ? "Claimed" : "Claim Gift"}
</Button>
```

### Step 7: Add Toast Notifications

Make sure you have toast notifications set up. Add to your layout or providers:

```typescript
import { Toaster } from '@/components/ui/sonner'

// In your layout component:
<Toaster />
```

---

## Testing Your Integration

### Step 1: Start Development Server

```bash
pnpm dev
```

### Step 2: Connect Your Wallet

1. Open `http://localhost:3000` in your browser
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve the connection
5. Make sure you're on Sepolia network

### Step 3: Test Creating a Gift

1. Fill in the "Create Gift" form:
   - Recipient Address: Use another address (or a test address)
   - ETH Amount: `0.01` (or any small amount)
   - Message: "Test gift!"
   - Unlock Date & Time: Set to a few minutes in the future (for testing)

2. Click "Create Gift Box"
3. Approve the transaction in MetaMask
4. Wait for confirmation
5. Check transaction on Etherscan (link should appear)

### Step 4: Test Claiming a Gift

1. Wait until unlock time passes (or use a past date for testing)
2. Go to "My Gifts" tab
3. You should see your gift
4. Click "Claim Gift"
5. Approve transaction in MetaMask
6. Gift should be claimed

### Step 5: Verify on Etherscan

1. Copy the contract address from `.env.local`
2. Go to [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
3. Search for your contract address
4. Go to "Contract" tab
5. Click "Read Contract"
6. Try calling `getGift` with a gift ID
7. Verify the data matches what you see in your app

---

## Troubleshooting

### Problem: "Contract address not set" error

**Solution:**
- Make sure `.env.local` exists and has `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Restart your dev server after adding environment variables
- Check that the variable name is exactly `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Problem: "Invalid address" error

**Solution:**
- Make sure the contract address starts with `0x`
- Verify the address is correct (42 characters total)
- Make sure you're using the deployed contract address, not the deployer address

### Problem: Transaction keeps failing

**Common causes:**
- **Insufficient gas:** Make sure you have enough ETH in your wallet
- **Wrong network:** Make sure MetaMask is on Sepolia testnet
- **Contract not deployed:** Verify contract is deployed on Sepolia
- **Invalid parameters:** Check that recipient address is valid (42 chars, starts with 0x)

### Problem: Gifts not showing up

**Solution:**
- Make sure you're connected with the correct wallet address (the recipient address)
- Check browser console for errors
- Verify the contract address is correct
- Try refreshing the page
- Check that `nextGiftId` is being read correctly

### Problem: "Module not found" errors

**Solution:**
- Run `pnpm install` again
- Delete `node_modules` and `pnpm-lock.yaml`, then `pnpm install`
- Check that file paths in imports are correct

### Problem: TypeScript errors

**Solution:**
- Make sure `tsconfig.json` has `"resolveJsonModule": true`
- Check that all types are imported correctly
- Restart your TypeScript server in VS Code

### Problem: Wallet won't connect

**Solution:**
- Make sure MetaMask is installed and unlocked
- Check that WalletConnect Project ID is set correctly
- Try disconnecting and reconnecting
- Clear browser cache and try again

### Problem: "Unlock time must be in the future" but it is

**Solution:**
- Make sure you're converting the datetime correctly (Unix timestamp in seconds)
- Check your timezone settings
- The contract uses `block.timestamp` which is in seconds since epoch

---

## Additional Resources

### Documentation

- **Wagmi Docs:** [https://wagmi.sh/](https://wagmi.sh/) - How to use wagmi hooks
- **Viem Docs:** [https://viem.sh/](https://viem.sh/) - Ethereum utilities
- **RainbowKit Docs:** [https://rainbowkit.com/](https://rainbowkit.com/) - Wallet connection UI
- **Solidity Docs:** [https://docs.soliditylang.org/](https://docs.soliditylang.org/) - Smart contract language
- **OpenZeppelin:** [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/) - Secure smart contract libraries

### Tools

- **Remix IDE:** [https://remix.ethereum.org/](https://remix.ethereum.org/) - Online Solidity IDE
- **Etherscan:** [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/) - Blockchain explorer
- **MetaMask:** [https://metamask.io/](https://metamask.io/) - Crypto wallet

### Test Networks

- **Sepolia Faucet:** [https://sepoliafaucet.com/](https://sepoliafaucet.com/) - Get free test ETH
- **QuickNode Faucet:** [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia) - Alternative faucet

### Community

- **Ethereum Stack Exchange:** [https://ethereum.stackexchange.com/](https://ethereum.stackexchange.com/) - Ask questions
- **Reddit r/ethdev:** [https://www.reddit.com/r/ethdev/](https://www.reddit.com/r/ethdev/) - Ethereum developers community
- **Discord:** Join Ethereum developer Discord servers for real-time help

---

## Next Steps

After successfully integrating the basic functionality:

1. **Add ERC-20 Token Support:** Implement the ERC-20 gift creation UI
2. **IPFS Integration:** Encrypt messages and store them on IPFS
3. **Better Gift Discovery:** Add filtering, searching, and sorting
4. **Notifications:** Add email or push notifications when gifts unlock
5. **Analytics:** Track how many gifts are created and claimed
6. **Multi-chain Support:** Deploy on other networks
7. **Mobile App:** Create a React Native version

---

## Quick Reference

### Important File Locations

```
chronovault-dapp/
├── .env.local                          # Environment variables (create this)
├── contracts/
│   └── giftBox.json                    # Contract ABI (add this)
├── lib/
│   ├── wagmi.ts                        # Wagmi configuration
│   └── giftBoxContract.ts             # Contract config (create this)
├── hooks/
│   ├── useGiftBox.ts                   # Contract hooks (create this)
│   └── useUserGifts.ts                 # User gifts hook (create this)
└── app/
    └── page.tsx                        # Main UI component (update this)
```

### Essential Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Your WalletConnect Project ID
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your deployed contract address
- [ ] (Optional) `NEXT_PUBLIC_INFURA_API_KEY` - Infura API key
- [ ] (Optional) `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key

---

## Final Notes

- Always test on testnets before deploying to mainnet
- Never share your private keys or seed phrases
- Keep your `.env.local` file secure and never commit it to Git
- Start with small amounts when testing
- Read transaction confirmations carefully before approving

Good luck with your integration! 🚀

If you encounter any issues not covered in this guide, check the troubleshooting section or refer to the documentation links provided.

