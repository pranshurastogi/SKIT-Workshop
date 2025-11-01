import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
import { parseEther, formatEther, parseUnits } from 'viem'
import { toast } from 'sonner'
import { useEffect } from 'react'

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
  const { 
    isLoading: isConfirming, 
    isSuccess, 
    isError: isReceiptError,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Check for circuit breaker errors in receipt
  useEffect(() => {
    if (isReceiptError && receiptError) {
      const errorMessage = receiptError.message || String(receiptError) || ''
      const isCircuitBreaker = 
        errorMessage.toLowerCase().includes('circuit breaker') ||
        errorMessage.toLowerCase().includes('circuit breaker is open')
      
      if (isCircuitBreaker) {
        toast.error('Contract is paused: Circuit breaker is open', {
          duration: 10000,
          description: 'The transaction was submitted but failed because the contract is paused.',
        })
      }
    }
  }, [isReceiptError, receiptError])

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
      
      // Parse error message from various possible locations in viem error structure
      const errorMessage = 
        err?.message || 
        err?.shortMessage || 
        err?.reason ||
        err?.cause?.message ||
        err?.cause?.reason ||
        err?.details ||
        String(err)
      
      const errorString = errorMessage.toLowerCase()
      
      // Check if it's a circuit breaker error (check multiple variations)
      const isCircuitBreaker = 
        errorString.includes('circuit breaker') ||
        errorString.includes('circuit breaker is open') ||
        errorString.includes('execution prevented because the circuit breaker') ||
        (errorString.includes('revert') && errorString.includes('circuit'))
      
      if (isCircuitBreaker) {
        const message = 'Contract is paused: The circuit breaker is currently open. Gift creation is temporarily disabled.'
        toast.error(message, {
          duration: 10000, // Show for longer since it's important
          description: 'This is a safety mechanism that can pause the contract in case of emergencies. Please contact the contract administrator or try again later.',
        })
        throw new Error(message)
      }
      
      // Check for other revert errors
      if (errorString.includes('revert')) {
        // Try to extract the revert reason if available
        const revertReasonMatch = errorMessage.match(/revert\s+(.+)/i)
        const revertReason = revertReasonMatch ? revertReasonMatch[1] : ''
        
        if (revertReason) {
          toast.error(`Transaction reverted: ${revertReason}`)
        } else {
          toast.error('Transaction reverted. Check your inputs and contract status.')
        }
      } else {
        toast.error(errorMessage || 'Failed to create gift')
      }
      
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
      
      // Parse error message for circuit breaker
      const errorMessage = err?.message || err?.shortMessage || String(err)
      const errorDetails = err?.details || err?.cause?.message || ''
      
      // Check if it's a circuit breaker error
      const isCircuitBreaker = 
        errorMessage.toLowerCase().includes('circuit breaker') ||
        errorMessage.toLowerCase().includes('circuit breaker is open') ||
        errorDetails.toLowerCase().includes('circuit breaker')
      
      if (isCircuitBreaker) {
        const message = 'Contract is paused: The circuit breaker is currently open. Gift claiming is temporarily disabled. Please contact the contract administrator or try again later.'
        toast.error(message, {
          duration: 10000,
          description: 'This is a safety mechanism that can pause the contract in case of emergencies.',
        })
        throw new Error(message)
      }
      
      // Check for other common errors
      if (errorMessage.toLowerCase().includes('revert')) {
        toast.error('Transaction reverted. The gift may have already been claimed or is not yet unlocked.')
      } else {
        toast.error(errorMessage || 'Failed to claim gift')
      }
      
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

