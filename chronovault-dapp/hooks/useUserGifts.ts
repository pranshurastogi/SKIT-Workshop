import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { GIFTBOX_CONTRACT_ADDRESS, GIFTBOX_ABI } from '@/lib/giftBoxContract'
import { useNextGiftId } from './useGiftBox'
import { useMemo, useEffect, useState } from 'react'
import { formatEther } from 'viem'

export interface UserGift {
  id: number
  sender: string
  recipient: string
  amount: string
  unlockTime: number // Unix timestamp in milliseconds
  encryptedMessageURI: string
  claimed: boolean
  assetType: number
  token: string
}

export function useUserGifts() {
  const { address } = useAccount()
  const { nextGiftId } = useNextGiftId()

  // Create contract read requests for all gifts using getGift function
  const contracts = useMemo(() => {
    if (nextGiftId === 0 || !GIFTBOX_CONTRACT_ADDRESS || !address) return []
    
    return Array.from({ length: nextGiftId }, (_, i) => ({
      address: GIFTBOX_CONTRACT_ADDRESS,
      abi: GIFTBOX_ABI,
      functionName: 'getGift' as const,
      args: [BigInt(i)],
    }))
  }, [nextGiftId, address])

  // Use useReadContract individually for each gift - but we need to do this properly
  // Instead, let's use useReadContracts which handles multiple reads
  const gift0 = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: contracts.length > 0 ? [BigInt(0)] : undefined,
    query: { enabled: contracts.length > 0 && !!address },
  })

  const gift1 = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: contracts.length > 1 ? [BigInt(1)] : undefined,
    query: { enabled: contracts.length > 1 && !!address },
  })

  // Collect all gift results - expand this pattern for more gifts if needed
  // For now, handle up to 10 gifts
  const gift2 = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: contracts.length > 2 ? [BigInt(2)] : undefined,
    query: { enabled: contracts.length > 2 && !!address },
  })

  const gift3 = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: contracts.length > 3 ? [BigInt(3)] : undefined,
    query: { enabled: contracts.length > 3 && !!address },
  })

  const gift4 = useReadContract({
    address: GIFTBOX_CONTRACT_ADDRESS,
    abi: GIFTBOX_ABI,
    functionName: 'getGift',
    args: contracts.length > 4 ? [BigInt(4)] : undefined,
    query: { enabled: contracts.length > 4 && !!address },
  })

  const allGiftResults = [gift0, gift1, gift2, gift3, gift4].slice(0, nextGiftId)
  
  // Check if any gift is still loading
  const isLoading = allGiftResults.some(result => result.isLoading)
  
  // Collect all gifts
  const allGifts = allGiftResults.map((result, index) => ({
    id: index,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
  }))

  // Debug logging
  useEffect(() => {
    console.log('[useUserGifts] State:', {
      nextGiftId,
      contractsCount: contracts.length,
      hasAddress: !!address,
      address,
      giftsLoaded: allGifts.filter(g => !!g.data).length,
      isLoading,
    })
  }, [nextGiftId, contracts.length, address, isLoading, allGifts])

  // Refetch when nextGiftId changes (new gift created)
  useEffect(() => {
    if (nextGiftId > 0 && address) {
      console.log('[useUserGifts] Refetching due to nextGiftId change:', nextGiftId)
      // Small delay to ensure block is mined, then refetch all
      const timeout = setTimeout(() => {
        allGiftResults.forEach(result => result.refetch())
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [nextGiftId, address, allGiftResults])

  // Filter gifts for current user
  const userGifts = useMemo(() => {
    if (!address) {
      console.log('[useUserGifts] No address:', { address })
      return []
    }

    console.log('[useUserGifts] Processing gifts:', { 
      giftsCount: allGifts.length, 
      address,
      nextGiftId 
    })

    const filtered = allGifts
      .filter((giftWrapper) => {
        const { id, data: gift, isLoading: isGiftLoading, error: giftError } = giftWrapper
        const index = id
        
        // Log the full gift data
        console.log(`[useUserGifts] Gift ${index}:`, {
          hasData: !!gift,
          isLoading: isGiftLoading,
          hasError: !!giftError,
          dataType: typeof gift,
          data: gift,
          error: giftError,
          dataKeys: gift && typeof gift === 'object' ? Object.keys(gift) : 'not an object',
          isArray: Array.isArray(gift),
        })
        
        // Skip if still loading
        if (isGiftLoading) {
          console.log(`[useUserGifts] Gift ${index} is still loading`)
          return false
        }
        
        // Skip if there's an error
        if (giftError) {
          console.log(`[useUserGifts] Gift ${index} has error:`, giftError)
          return false
        }
        
        if (!gift) {
          console.log(`[useUserGifts] Gift ${index} has no data`)
          return false
        }

        const giftData = gift as any
        
        // Handle both array and object formats that wagmi might return
        // Solidity structs can be returned as objects with named fields or as tuples (arrays)
        const sender = giftData?.sender || (Array.isArray(giftData) ? giftData[0] : null)
        const recipient = giftData?.recipient || (Array.isArray(giftData) ? giftData[1] : null)
        const unlockTime = giftData?.unlockTime || (Array.isArray(giftData) ? giftData[2] : null)
        const assetType = giftData?.assetType !== undefined ? giftData.assetType : (Array.isArray(giftData) ? giftData[3] : 0)
        const token = giftData?.token || (Array.isArray(giftData) ? giftData[4] : null)
        const amount = giftData?.amount || (Array.isArray(giftData) ? giftData[5] : null)
        const encryptedMessageURI = giftData?.encryptedMessageURI || (Array.isArray(giftData) ? giftData[6] : '')
        const claimed = giftData?.claimed !== undefined ? giftData.claimed : (Array.isArray(giftData) ? giftData[7] : false)
        
        // Normalize sender address for validation
        let senderStr = ''
        if (sender) {
          if (typeof sender === 'string') {
            senderStr = sender.trim().toLowerCase()
          } else if (typeof sender === 'object' && sender?.toString) {
            senderStr = sender.toString().trim().toLowerCase()
          } else {
            senderStr = String(sender).trim().toLowerCase()
          }
        }

        // Check if gift exists - a valid gift must have a non-zero sender
        // In Solidity, uninitialized structs have all fields as zero/default values
        const zeroAddress = '0x0000000000000000000000000000000000000000'
        if (!senderStr || 
            senderStr === zeroAddress || 
            senderStr === '0x' ||
            senderStr.length < 42) {
          console.log(`[useUserGifts] Gift ${index} has invalid sender:`, senderStr)
          return false
        }

        // Normalize recipient address - handle all possible formats
        let recipientStr = ''
        if (recipient) {
          if (typeof recipient === 'string') {
            recipientStr = recipient.trim().toLowerCase()
          } else if (typeof recipient === 'object' && recipient?.toString) {
            recipientStr = recipient.toString().trim().toLowerCase()
          } else {
            recipientStr = String(recipient).trim().toLowerCase()
          }
        }

        // Normalize user address
        const userAddress = (address || '').trim().toLowerCase()

        // Check if current user is the recipient (case-insensitive comparison)
        const isRecipient = recipientStr === userAddress && recipientStr !== '' && recipientStr.length >= 42

        console.log(`[useUserGifts] Gift ${index} filtering:`, {
          sender: senderStr,
          recipient: recipientStr,
          userAddress,
          isRecipient,
          recipientMatch: recipientStr === userAddress,
          recipientLength: recipientStr.length,
          userAddressLength: userAddress.length,
          amount: amount?.toString(),
          claimed,
          giftStructure: Array.isArray(giftData) ? 'array' : 'object'
        })

        if (!isRecipient) {
          return false
        }

        return true
      })
      .map((giftWrapper) => {
        const { id: index, data: gift } = giftWrapper
        const giftData = gift as any
        
        // Extract gift fields with null/undefined safety
        const sender = giftData?.sender || (Array.isArray(giftData) ? giftData[0] : null)
        const recipient = giftData?.recipient || (Array.isArray(giftData) ? giftData[1] : null)
        const unlockTime = giftData?.unlockTime !== undefined ? giftData.unlockTime : (Array.isArray(giftData) && giftData[2] !== undefined ? giftData[2] : null)
        const assetType = giftData?.assetType !== undefined ? giftData.assetType : (Array.isArray(giftData) && giftData[3] !== undefined ? giftData[3] : 0)
        const token = giftData?.token || (Array.isArray(giftData) ? giftData[4] : null)
        const amount = giftData?.amount !== undefined ? giftData.amount : (Array.isArray(giftData) && giftData[5] !== undefined ? giftData[5] : null)
        const encryptedMessageURI = giftData?.encryptedMessageURI || (Array.isArray(giftData) && giftData[6] !== undefined ? giftData[6] : '')
        const claimed = giftData?.claimed !== undefined ? giftData.claimed : (Array.isArray(giftData) && giftData[7] !== undefined ? giftData[7] : false)

        // Normalize addresses (case-insensitive)
        const normalizedSender = sender 
          ? (typeof sender === 'string' ? sender.trim().toLowerCase() : sender.toString().trim().toLowerCase())
          : ''
        const normalizedRecipient = recipient 
          ? (typeof recipient === 'string' ? recipient.trim().toLowerCase() : recipient.toString().trim().toLowerCase())
          : ''

        // Safely handle BigInt values
        let finalAmount: bigint
        try {
          if (amount === null || amount === undefined) {
            finalAmount = BigInt(0)
          } else if (typeof amount === 'bigint') {
            finalAmount = amount
          } else if (typeof amount === 'string' || typeof amount === 'number') {
            finalAmount = BigInt(amount)
          } else {
            finalAmount = BigInt(0)
          }
        } catch (e) {
          console.error(`[useUserGifts] Error parsing amount for gift ${index}:`, e)
          finalAmount = BigInt(0)
        }

        // Safely handle unlock time
        let finalUnlockTime: bigint
        try {
          if (unlockTime === null || unlockTime === undefined) {
            finalUnlockTime = BigInt(0)
          } else if (typeof unlockTime === 'bigint') {
            finalUnlockTime = unlockTime
          } else if (typeof unlockTime === 'string' || typeof unlockTime === 'number') {
            finalUnlockTime = BigInt(unlockTime)
          } else {
            finalUnlockTime = BigInt(0)
          }
        } catch (e) {
          console.error(`[useUserGifts] Error parsing unlockTime for gift ${index}:`, e)
          finalUnlockTime = BigInt(0)
        }

        // Safely parse other fields
        const finalAssetType = Number(assetType) || 0
        const finalToken = token 
          ? (typeof token === 'string' ? token.trim().toLowerCase() : token.toString().trim().toLowerCase())
          : '0x0000000000000000000000000000000000000000'
        const finalEncryptedMessageURI = encryptedMessageURI?.toString() || ''

        // Convert unlock time to milliseconds (handle edge case where it's 0)
        const unlockTimeMs = finalUnlockTime > BigInt(0) 
          ? Number(finalUnlockTime) * 1000 
          : 0

        return {
          id: index,
          sender: normalizedSender,
          recipient: normalizedRecipient,
          amount: formatEther(finalAmount),
          unlockTime: unlockTimeMs,
          encryptedMessageURI: finalEncryptedMessageURI,
          claimed: Boolean(claimed),
          assetType: finalAssetType,
          token: finalToken,
        }
      })

    console.log('[useUserGifts] Filtered gifts:', filtered.length, filtered)
    return filtered
  }, [allGifts, address, nextGiftId])

  // Refetch function that refetches all gifts
  const refetch = () => {
    allGiftResults.forEach(result => result.refetch())
  }

  return {
    gifts: userGifts,
    isLoading,
    error: allGifts.find(g => g.error)?.error || null,
    refetch,
    // Debug information
    debug: {
      nextGiftId,
      allGiftsCount: allGifts.length,
      allGiftsWithData: allGifts.filter(g => !!g.data).length,
      allGiftsLoading: allGifts.filter(g => g.isLoading).length,
      allGiftsWithErrors: allGifts.filter(g => !!g.error).length,
      userAddress: address || '',
      contractAddress: GIFTBOX_CONTRACT_ADDRESS,
      allGiftsRaw: allGifts.map((g, idx) => ({
        id: idx,
        hasData: !!g.data,
        isLoading: g.isLoading,
        hasError: !!g.error,
        error: g.error?.message,
        rawData: g.data,
      })),
    },
  }
}

