"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Lock, Unlock, Info, BookOpen, ExternalLink, Wallet, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useCreateEthGift, useClaimGift } from "@/hooks/useGiftBox"
import { useUserGifts } from "@/hooks/useUserGifts"
import { GIFTBOX_CONTRACT_ADDRESS } from "@/lib/giftBoxContract"
import { toast } from "sonner"

export default function ChronoVault() {
  const { address, isConnected } = useAccount()

  // Create Gift Box State
  const [recipientAddress, setRecipientAddress] = useState("")
  const [ethAmount, setEthAmount] = useState("")
  const [message, setMessage] = useState("")
  const [unlockDateTime, setUnlockDateTime] = useState("")

  // Contract hooks
  const { createEthGift, isPending: isCreating, isSuccess: createSuccess, error: createError, reset: resetCreate } = useCreateEthGift()
  const { claimGift, isPending: isClaiming, isSuccess: claimSuccess, error: claimError, reset: resetClaim } = useClaimGift()
  const { gifts: receivedGifts, isLoading: isLoadingGifts, refetch: refetchGifts, debug: debugInfo } = useUserGifts()
  
  // State for showing/hiding detailed boxes
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [expandedGifts, setExpandedGifts] = useState<Set<number>>(new Set())
  const [showCreatePreview, setShowCreatePreview] = useState(false)

  // Reset form on successful creation
  useEffect(() => {
    if (createSuccess) {
      setRecipientAddress("")
      setEthAmount("")
      setMessage("")
      setUnlockDateTime("")
      toast.success("Gift box created successfully!")
      
      // Wait a bit for the transaction to be mined, then refetch gifts
      // This ensures the contract state has been updated
      const timeout1 = setTimeout(() => {
        console.log('[Page] Refetching gifts after gift creation')
        refetchGifts?.()
      }, 3000) // Wait 3 seconds for block confirmation
      
      // Reset the hook state after showing success
      const timeout2 = setTimeout(() => {
        resetCreate?.()
      }, 2000)
      
      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
      }
    }
  }, [createSuccess, resetCreate, refetchGifts])

  // Handle create errors
  useEffect(() => {
    if (createError) {
      toast.error(createError.message || "Failed to create gift box")
    }
  }, [createError])

  // Show success message on claim
  useEffect(() => {
    if (claimSuccess) {
      toast.success("Gift claimed successfully!")
      // Refetch gifts to update the claimed status
      refetchGifts?.()
      // Reset the hook state after showing success
      setTimeout(() => {
        resetClaim?.()
      }, 2000)
    }
  }, [claimSuccess, resetClaim, refetchGifts])

  // Handle claim errors
  useEffect(() => {
    if (claimError) {
      toast.error(claimError.message || "Failed to claim gift")
    }
  }, [claimError])

  const handleCreateGiftBox = () => {
    // Validation
    if (!recipientAddress || !ethAmount || !unlockDateTime) {
      toast.error("Please fill in all fields")
      return
    }

    if (!isValidAddress(recipientAddress)) {
      toast.error("Invalid recipient address")
      return
    }

    const unlockTimestamp = Math.floor(new Date(unlockDateTime).getTime() / 1000)
    const now = Math.floor(Date.now() / 1000)

    if (unlockTimestamp <= now) {
      toast.error("Unlock time must be in the future")
      return
    }

    // For now, we'll use the message as the encryptedMessageURI
    // In a real app, you would encrypt this on the client side
    const encryptedMessageURI = message || "ipfs://" // Placeholder for encrypted message

    createEthGift(
      recipientAddress,
      unlockTimestamp,
      encryptedMessageURI,
      ethAmount
    )
  }

  const handleClaimGift = (giftId: number) => {
    claimGift(giftId)
  }

  // Helper function to validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  // Toggle gift expansion
  const toggleGiftExpansion = (giftId: number) => {
    setExpandedGifts(prev => {
      const next = new Set(prev)
      if (next.has(giftId)) {
        next.delete(giftId)
      } else {
        next.add(giftId)
      }
      return next
    })
  }
  
  // Calculate unlock timestamp for preview
  const getUnlockTimestamp = () => {
    if (!unlockDateTime) return null
    return Math.floor(new Date(unlockDateTime).getTime() / 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Gift className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ChronoVault
              </h1>
              <p className="text-xs text-muted-foreground">SKIT Blockchain Lab</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <BookOpen className="h-4 w-4" />
                  Learn More
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Learn About ChronoVault</DialogTitle>
                  <DialogDescription>
                    Educational resources for building time-locked gift smart contracts
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">What is ChronoVault?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      ChronoVault is an educational dApp that teaches you how to integrate smart contracts with a
                      frontend. Users can lock ETH in a smart contract with a message for a specific recipient, who can
                      only claim it after a specified date and time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Key Concepts</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <strong className="text-foreground">Smart Contracts:</strong> Self-executing code on the
                          blockchain
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>
                          <strong className="text-foreground">Time Locks:</strong> Using block timestamps to restrict
                          access
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>
                          <strong className="text-foreground">Web3 Integration:</strong> Connecting frontend to
                          blockchain via ethers.js or wagmi
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <strong className="text-foreground">Transactions:</strong> Sending ETH and calling contract
                          functions
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Smart Contract Design</h3>
                    <div className="rounded-lg bg-muted p-4 font-mono text-xs space-y-2">
                      <p className="text-muted-foreground">// Key functions your contract should have:</p>
                      <p className="text-foreground">
                        <span className="text-primary">function</span> createGift(address recipient, string message,
                        uint256 unlockTime)
                      </p>
                      <p className="text-foreground">
                        <span className="text-primary">function</span> claimGift(uint256 giftId)
                      </p>
                      <p className="text-foreground">
                        <span className="text-primary">function</span> getGiftsForRecipient(address recipient)
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Helpful Resources</h3>
                    <div className="space-y-2">
                      <a
                        href="https://docs.soliditylang.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Solidity Documentation
                      </a>
                      <a
                        href="https://docs.ethers.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ethers.js Documentation
                      </a>
                      <a
                        href="https://wagmi.sh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Wagmi Documentation
                      </a>
                      <a
                        href="https://ethereum.org/en/developers/docs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ethereum Developer Docs
                      </a>
                      <a
                        href="https://docs.openzeppelin.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        OpenZeppelin Contracts
                      </a>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Card className="mx-auto max-w-md shadow-xl border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Gift className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome to ChronoVault</CardTitle>
              <CardDescription className="text-base">
                Connect your wallet to start sending time-locked gifts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading'
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated')

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <Button onClick={openConnectModal} size="lg" className="gap-2">
                                <Wallet className="h-5 w-5" />
                                Connect Wallet
                              </Button>
                            )
                          }

                          if (chain.unsupported) {
                            return (
                              <Button onClick={openChainModal} size="lg" variant="destructive" className="gap-2">
                                Wrong network
                              </Button>
                            )
                          }

                          return null
                        })()}
                      </div>
                    )
                  }}
                </ConnectButton.Custom>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Connected to Sepolia Testnet:</strong> Make sure you're using Sepolia testnet ETH for transactions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="create" className="mx-auto max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="create" className="gap-2 text-base">
                <Lock className="h-5 w-5" />
                Create Gift
              </TabsTrigger>
              <TabsTrigger value="receive" className="gap-2 text-base">
                <Unlock className="h-5 w-5" />
                My Gifts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Create a Time-Locked Gift Box
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            Lock ETH in a smart contract that only the recipient can claim after the unlock date/time
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Send ETH to someone that they can only claim after a specific date and time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="flex items-center gap-2 text-base">
                      Recipient Address
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">The Ethereum address that will receive the gift</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="font-mono h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2 text-base">
                      ETH Amount
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Amount of ETH to lock in the gift box</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.1"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 text-base">
                      Gift Message
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">A personal message stored on-chain with the gift</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Write a message for the recipient..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unlock-datetime" className="flex items-center gap-2 text-base">
                      Unlock Date & Time
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">The recipient can only claim after this date and time</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="unlock-datetime"
                      type="datetime-local"
                      value={unlockDateTime}
                      onChange={(e) => setUnlockDateTime(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Preview/Details Box */}
                  {(recipientAddress || ethAmount || unlockDateTime || message) && (
                    <Card className="border-2 border-primary/30 bg-primary/5">
                      <Collapsible open={showCreatePreview} onOpenChange={setShowCreatePreview}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Preview Gift Details</CardTitle>
                              </div>
                              {showCreatePreview ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="space-y-3 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <p className="font-semibold text-foreground">Recipient Information:</p>
                                <div className="bg-background/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                                  <p>
                                    <span className="text-muted-foreground">Address:</span>{' '}
                                    {recipientAddress || <span className="text-yellow-600">Not set</span>}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Valid:</span>{' '}
                                    {recipientAddress ? (
                                      isValidAddress(recipientAddress) ? (
                                        <span className="text-green-600">✓ Valid</span>
                                      ) : (
                                        <span className="text-red-600">✗ Invalid</span>
                                      )
                                    ) : (
                                      <span className="text-muted-foreground">N/A</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="font-semibold text-foreground">Gift Amount:</p>
                                <div className="bg-background/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                                  <p>
                                    <span className="text-muted-foreground">ETH:</span>{' '}
                                    {ethAmount || <span className="text-yellow-600">Not set</span>}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Valid:</span>{' '}
                                    {ethAmount ? (
                                      parseFloat(ethAmount) > 0 ? (
                                        <span className="text-green-600">✓ Valid</span>
                                      ) : (
                                        <span className="text-red-600">✗ Must be greater than 0</span>
                                      )
                                    ) : (
                                      <span className="text-muted-foreground">N/A</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {unlockDateTime && (
                              <div className="space-y-2">
                                <p className="font-semibold text-foreground text-sm">Unlock Schedule:</p>
                                <div className="bg-background/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                                  <p>
                                    <span className="text-muted-foreground">Date & Time:</span>{' '}
                                    {new Date(unlockDateTime).toLocaleString() || 'Not set'}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Unix Timestamp:</span>{' '}
                                    {getUnlockTimestamp() || 'Not set'}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Status:</span>{' '}
                                    {unlockDateTime ? (
                                      getUnlockTimestamp() && getUnlockTimestamp()! > Math.floor(Date.now() / 1000) ? (
                                        <span className="text-green-600">✓ Future date</span>
                                      ) : (
                                        <span className="text-red-600">✗ Must be in the future</span>
                                      )
                                    ) : (
                                      <span className="text-yellow-600">Not set</span>
                                    )}
                                  </p>
                                  {getUnlockTimestamp() && (
                                    <p>
                                      <span className="text-muted-foreground">Time Until Unlock:</span>{' '}
                                      {(() => {
                                        const seconds = getUnlockTimestamp()! - Math.floor(Date.now() / 1000)
                                        if (seconds <= 0) return 'Invalid (past date)'
                                        const days = Math.floor(seconds / 86400)
                                        const hours = Math.floor((seconds % 86400) / 3600)
                                        const minutes = Math.floor((seconds % 3600) / 60)
                                        return `${days}d ${hours}h ${minutes}m`
                                      })()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {message && (
                              <div className="space-y-2">
                                <p className="font-semibold text-foreground text-sm">Message:</p>
                                <div className="bg-background/80 rounded-lg p-3">
                                  <p className="text-xs break-words whitespace-pre-wrap">{message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Length: {message.length} characters
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground text-sm">Transaction Details:</p>
                              <div className="bg-background/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                                <p>
                                  <span className="text-muted-foreground">Function:</span> createEthGift()
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Contract:</span>{' '}
                                  {GIFTBOX_CONTRACT_ADDRESS}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Message URI:</span>{' '}
                                  {message || 'ipfs://'}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">ETH Value:</span>{' '}
                                  {ethAmount || '0'} ETH
                                </p>
                              </div>
                            </div>
                            
                            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                Validation Status:
                              </p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>
                                  {recipientAddress && isValidAddress(recipientAddress) ? (
                                    <span className="text-green-600">✓ Recipient address is valid</span>
                                  ) : (
                                    <span className="text-red-600">✗ Recipient address is invalid or missing</span>
                                  )}
                                </p>
                                <p>
                                  {ethAmount && parseFloat(ethAmount) > 0 ? (
                                    <span className="text-green-600">✓ ETH amount is valid</span>
                                  ) : (
                                    <span className="text-red-600">✗ ETH amount is invalid or missing</span>
                                  )}
                                </p>
                                <p>
                                  {unlockDateTime && getUnlockTimestamp() && getUnlockTimestamp()! > Math.floor(Date.now() / 1000) ? (
                                    <span className="text-green-600">✓ Unlock time is in the future</span>
                                  ) : (
                                    <span className="text-red-600">✗ Unlock time must be in the future</span>
                                  )}
                                </p>
                                <p>
                                  {recipientAddress && isValidAddress(recipientAddress) && 
                                   ethAmount && parseFloat(ethAmount) > 0 && 
                                   unlockDateTime && getUnlockTimestamp() && getUnlockTimestamp()! > Math.floor(Date.now() / 1000) ? (
                                    <span className="text-green-600 font-semibold">✓ All fields valid - ready to create!</span>
                                  ) : (
                                    <span className="text-yellow-600">⚠ Please fill all required fields correctly</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )}

                  <Button 
                    onClick={handleCreateGiftBox} 
                    className="w-full gap-2 h-12 text-base" 
                    size="lg"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Gift className="h-5 w-5" />
                        Create Gift Box
                      </>
                    )}
                  </Button>

                  <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong className="text-primary">For Students:</strong> This button will call your smart
                      contract's{" "}
                      <code className="rounded bg-background px-2 py-1 font-mono text-xs border">createGift()</code>{" "}
                      function with the form data. You'll need to convert the datetime to a Unix timestamp and send ETH
                      as msg.value.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receive" className="mt-6">
              <div className="space-y-4">
                {/* Comprehensive Debug Panel */}
                <Card className="shadow-md border-blue-500/30 bg-blue-500/5">
                  <Collapsible open={showDebugInfo} onOpenChange={setShowDebugInfo}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-blue-500/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Debug Information</CardTitle>
                          </div>
                          {showDebugInfo ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <CardDescription>
                          Troubleshooting info for debugging gift visibility issues
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="font-semibold text-foreground">Connection Status:</p>
                            <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                              <p><span className="text-muted-foreground">Address:</span> {address || 'Not connected'}</p>
                              <p><span className="text-muted-foreground">Is Loading:</span> {isLoadingGifts ? 'Yes' : 'No'}</p>
                              <p><span className="text-muted-foreground">Contract:</span> {debugInfo?.contractAddress || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-semibold text-foreground">Gift Statistics:</p>
                            <div className="bg-background/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                              <p><span className="text-muted-foreground">Next Gift ID:</span> {debugInfo?.nextGiftId ?? 'Loading...'}</p>
                              <p><span className="text-muted-foreground">Total Gifts Checked:</span> {debugInfo?.allGiftsCount ?? 0}</p>
                              <p><span className="text-muted-foreground">Gifts with Data:</span> {debugInfo?.allGiftsWithData ?? 0}</p>
                              <p><span className="text-muted-foreground">Currently Loading:</span> {debugInfo?.allGiftsLoading ?? 0}</p>
                              <p><span className="text-muted-foreground">Gifts with Errors:</span> {debugInfo?.allGiftsWithErrors ?? 0}</p>
                              <p><span className="text-muted-foreground">Filtered for You:</span> {receivedGifts.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        {debugInfo && debugInfo.allGiftsRaw && debugInfo.allGiftsRaw.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-semibold text-foreground">Raw Gift Data:</p>
                            <div className="bg-background/50 rounded-lg p-3 max-h-96 overflow-y-auto">
                              <div className="space-y-3 text-xs font-mono">
                                {debugInfo.allGiftsRaw.map((giftRaw, idx) => {
                                  const gift = receivedGifts.find(g => g.id === idx)
                                  return (
                                    <div key={idx} className="border-b border-border/50 pb-2 last:border-0">
                                      <p className="font-semibold text-primary mb-1">Gift ID: {giftRaw.id}</p>
                                      <p className="text-muted-foreground">Has Data: {giftRaw.hasData ? 'Yes' : 'No'}</p>
                                      <p className="text-muted-foreground">Is Loading: {giftRaw.isLoading ? 'Yes' : 'No'}</p>
                                      <p className="text-muted-foreground">Has Error: {giftRaw.hasError ? 'Yes' : 'No'}</p>
                                      {giftRaw.hasError && (
                                        <p className="text-red-500 text-xs mt-1">Error: {giftRaw.error || 'Unknown error'}</p>
                                      )}
                                      {giftRaw.hasData && giftRaw.rawData && (
                                        <div className="mt-2 p-2 bg-background/80 rounded text-xs overflow-x-auto">
                                          <pre className="whitespace-pre-wrap break-words">
                                            {JSON.stringify(giftRaw.rawData, (key, value) => 
                                              typeof value === 'bigint' ? value.toString() : value, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {gift ? (
                                        <p className="text-green-600 text-xs mt-1">✓ This gift is visible to you (matched recipient)</p>
                                      ) : giftRaw.hasData && (
                                        <p className="text-yellow-600 text-xs mt-1">⚠ This gift exists but you're not the recipient</p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Troubleshooting Tips:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            <li>If you see gifts with data but they don't appear in your list, check that the recipient address matches your address exactly</li>
                            <li>If gifts are loading, wait a few seconds and check the console for detailed logs</li>
                            <li>If you see errors, check your network connection and contract address</li>
                            <li>Make sure you're connected to the correct network (Sepolia testnet)</li>
                            <li>Address comparison is case-insensitive - check the raw data to see the actual recipient</li>
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                
                {isLoadingGifts ? (
                  <Card className="shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="mb-4 h-16 w-16 text-muted-foreground animate-spin" />
                      <p className="text-lg text-muted-foreground">Loading your gifts...</p>
                    </CardContent>
                  </Card>
                ) : receivedGifts.length === 0 ? (
                  <Card className="shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Gift className="mb-4 h-16 w-16 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground">No gifts received yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Connected as: {address?.slice(0, 8)}...{address?.slice(-6)}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  receivedGifts.map((gift) => {
                    const unlockDate = new Date(gift.unlockTime)
                    const isUnlocked = new Date() >= unlockDate
                    const isExpanded = expandedGifts.has(gift.id)
                    const giftRawData = debugInfo?.allGiftsRaw?.find(gr => gr.id === gift.id)

                    return (
                      <Card key={gift.id} className="shadow-lg border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                Gift from {formatAddress(gift.sender)}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-sm font-mono">{gift.sender}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </CardTitle>
                              {gift.encryptedMessageURI && gift.encryptedMessageURI !== "ipfs://" && (
                                <CardDescription className="mt-2 text-base">
                                  {gift.encryptedMessageURI.startsWith("ipfs://") 
                                    ? "Encrypted message available" 
                                    : gift.encryptedMessageURI}
                                </CardDescription>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {parseFloat(gift.amount).toFixed(4)} ETH
                              </p>
                              {gift.assetType === 1 && (
                                <p className="text-xs text-muted-foreground mt-1">ERC-20 Token</p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <>
                                  <Unlock className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-600">Unlocked & Ready to Claim</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Unlocks on {unlockDate.toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                            <Button
                              onClick={() => handleClaimGift(gift.id)}
                              disabled={!isUnlocked || gift.claimed || isClaiming}
                              variant={isUnlocked ? "default" : "secondary"}
                              className="h-10"
                            >
                              {isClaiming ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Claiming...
                                </>
                              ) : gift.claimed ? (
                                "Claimed"
                              ) : (
                                "Claim Gift"
                              )}
                            </Button>
                          </div>
                          
                          {/* Expandable Details Section */}
                          <Collapsible open={isExpanded} onOpenChange={() => toggleGiftExpansion(gift.id)}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-4 justify-between"
                              >
                                <span className="text-xs">View Details</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-4 pt-4 border-t border-border space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-foreground">Gift Information:</p>
                                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                                      <p><span className="text-muted-foreground">Gift ID:</span> {gift.id}</p>
                                      <p><span className="text-muted-foreground">Sender:</span> {gift.sender}</p>
                                      <p><span className="text-muted-foreground">Recipient:</span> {gift.recipient}</p>
                                      <p><span className="text-muted-foreground">Amount:</span> {gift.amount} ETH</p>
                                      <p><span className="text-muted-foreground">Asset Type:</span> {gift.assetType === 0 ? 'Native (ETH)' : 'ERC-20'}</p>
                                      {gift.assetType === 1 && (
                                        <p><span className="text-muted-foreground">Token:</span> {gift.token}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="font-semibold text-foreground">Timing & Status:</p>
                                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                                      <p><span className="text-muted-foreground">Unlock Time:</span> {new Date(gift.unlockTime).toLocaleString()}</p>
                                      <p><span className="text-muted-foreground">Unlock Timestamp:</span> {Math.floor(gift.unlockTime / 1000)}</p>
                                      <p><span className="text-muted-foreground">Current Time:</span> {new Date().toLocaleString()}</p>
                                      <p><span className="text-muted-foreground">Is Unlocked:</span> {isUnlocked ? 'Yes' : 'No'}</p>
                                      <p><span className="text-muted-foreground">Is Claimed:</span> {gift.claimed ? 'Yes' : 'No'}</p>
                                      <p><span className="text-muted-foreground">Time Remaining:</span> {
                                        isUnlocked 
                                          ? 'Ready to claim' 
                                          : `${Math.ceil((gift.unlockTime - Date.now()) / (1000 * 60 * 60))} hours`
                                      }</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {gift.encryptedMessageURI && (
                                  <div className="space-y-2">
                                    <p className="font-semibold text-foreground text-sm">Message URI:</p>
                                    <div className="bg-muted/50 rounded-lg p-3">
                                      <p className="text-xs font-mono break-all">{gift.encryptedMessageURI}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {giftRawData && giftRawData.rawData && (
                                  <div className="space-y-2">
                                    <p className="font-semibold text-foreground text-sm">Raw Contract Data:</p>
                                    <div className="bg-muted/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                                      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                                        {JSON.stringify(giftRawData.rawData, (key, value) => 
                                          typeof value === 'bigint' ? value.toString() : value, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>
                    )
                  })
                )}

                <div className="rounded-lg bg-gradient-to-r from-secondary/10 to-accent/10 border-2 border-secondary/20 p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong className="text-secondary">For Students:</strong> Fetch gifts using{" "}
                    <code className="rounded bg-background px-2 py-1 font-mono text-xs border">
                      getGiftsForRecipient()
                    </code>{" "}
                    and claim with{" "}
                    <code className="rounded bg-background px-2 py-1 font-mono text-xs border">claimGift()</code>. Check
                    if block.timestamp is greater than unlockTime before allowing claims.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Created by{" "}
            <a
              href="https://pranshurastogi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Pranshu Rastogi
            </a>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">SKIT Blockchain Development Lab</p>
        </div>
      </footer>
    </div>
  )
}
