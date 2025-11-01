import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
import { parseEther, formatEther, parseUnits } from 'viem'
import { toast } from 'sonner'

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

/**
 * Hook to create an ETH gift
 */
export function useCreateEthGift() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
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
    } catch (err: any) {
      console.error('Error creating ETH gift:', err)
      toast.error(err?.message || 'Failed to create gift')
      throw err
    }
  }

  return {
    createEthGift,
    hash,
    isPending: (isPending || isConfirming) && !isSuccess,
    isConfirming,
    isSuccess,
    error,
    reset,
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
    isPending: isPending || isConfirming,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to claim a gift
 */
export function useClaimGift() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
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
    } catch (err: any) {
      console.error('Error claiming gift:', err)
      toast.error(err?.message || 'Failed to claim gift')
      throw err
    }
  }

  return {
    claimGift,
    hash,
    isPending: (isPending || isConfirming) && !isSuccess,
    isConfirming,
    isSuccess,
    error,
    reset,
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
      enabled: giftId !== null && !!GIFTBOX_CONTRACT_ADDRESS,
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
  const { data, isLoading, error, refetch } = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'nextGiftId',
    query: {
      enabled: !!GIFTBOX_CONTRACT_ADDRESS,
      refetchInterval: 3000, // Refetch every 3 seconds to catch new gifts
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  })

  return {
    nextGiftId: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  }
}

