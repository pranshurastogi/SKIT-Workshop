# Building the GiftBox Smart Contract: A Beginner's Guide

## Introduction

Welcome! This guide will walk you through building a **GiftBox** smart contract from scratch. Think of this contract as a digital vault where someone can lock up a gift (ETH or tokens) for a specific person, and that person can only claim it after a certain time.

### What You'll Learn
- How to structure a Solidity contract
- Working with ETH and ERC-20 tokens
- Time-locking functionality
- Security best practices using OpenZeppelin
- Event emissions for frontend integration

---

## Step 1: Setting Up the Foundation

### 1.1 License and Pragma

Every Solidity contract should start with:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
```

**Why?**
- The license identifier helps tools understand your contract's license
- The `pragma` statement tells the compiler which Solidity version to use (`^0.8.24` means version 0.8.24 or newer, but not 0.9.0)

**Your Task:** Write these two lines at the top of your file.

---

### 1.2 Understanding What We Need

Before writing code, let's think about what our contract needs to do:
1. **Store gifts** - We need to remember who sent what to whom
2. **Lock assets** - Hold ETH or tokens until unlock time
3. **Release assets** - Let recipients claim after the unlock time
4. **Prevent attacks** - Protect against common vulnerabilities

---

## Step 2: Importing OpenZeppelin Libraries

### 2.1 Why OpenZeppelin?

OpenZeppelin provides battle-tested, secure contracts. We'll use:
- `ReentrancyGuard` - Prevents reentrancy attacks (when a function calls itself maliciously)
- `IERC20` - Interface for interacting with ERC-20 tokens
- `SafeERC20` - Safe wrapper for ERC-20 operations (handles tokens that don't return `true` on success)

### 2.2 Writing the Imports

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
```

**Your Task:** Add these three import statements after your pragma.

**Thinking Process:**
- We import `ReentrancyGuard` because we'll handle user funds and need protection
- `IERC20` gives us the standard interface to interact with any ERC-20 token
- `SafeERC20` makes token transfers safer by handling edge cases

---

## Step 3: Creating the Contract and Using Libraries

### 3.1 Contract Declaration

```solidity
contract GiftBox is ReentrancyGuard {
    using SafeERC20 for IERC20;
```

**What's Happening?**
- `contract GiftBox` - We're declaring our contract named "GiftBox"
- `is ReentrancyGuard` - Our contract inherits protection from ReentrancyGuard
- `using SafeERC20 for IERC20` - This lets us use safer functions like `safeTransfer` on any IERC20 variable

**Your Task:** Write the contract declaration and the `using` statement.

---

## Step 4: Defining Data Structures

### 4.1 The AssetType Enum

First, we need to know what type of asset is in the gift:

```solidity
enum AssetType { NATIVE, ERC20 }
```

**Why an Enum?**
- Enums let us create custom types with limited options
- `NATIVE` = Ethereum (ETH)
- `ERC20` = Any ERC-20 token
- This makes our code cleaner and prevents invalid values

**Your Task:** Create the enum inside your contract.

**Thinking Process:**
- We could use a boolean (ETH vs token), but an enum is more readable
- It's easier to extend later (e.g., add NFT support)

---

### 4.2 The Gift Struct

A struct groups related data together. Think of it like a form with multiple fields:

```solidity
struct Gift {
    address sender;              // Who created the gift
    address recipient;          // Who can claim it
    uint256 unlockTime;         // When it can be claimed (unix timestamp)
    AssetType assetType;        // Is it ETH or a token?
    address token;              // Token address (or 0x0 for ETH)
    uint256 amount;             // How much is locked
    string encryptedMessageURI; // Link to encrypted message (IPFS)
    bool claimed;               // Has it been claimed yet?
}
```

**Why Each Field?**
- `sender` - Need to know who sent it (for records)
- `recipient` - Only this address can claim
- `unlockTime` - Controls when claiming is allowed
- `assetType` - Determines if we transfer ETH or tokens
- `token` - Which token contract (if not ETH)
- `amount` - How much to transfer
- `encryptedMessageURI` - Private message location
- `claimed` - Prevents double-claiming

**Your Task:** Create the Gift struct with all these fields.

**Thinking Process:**
- We need all this information to handle a gift properly
- The `claimed` flag prevents someone from claiming the same gift twice
- The `unlockTime` uses a unix timestamp (seconds since Jan 1, 1970)

---

## Step 5: State Variables

### 5.1 Tracking Gifts

We need storage for our gifts:

```solidity
uint256 public nextGiftId;
mapping(uint256 => Gift) public gifts;
```

**What's Happening?**
- `nextGiftId` - A counter that starts at 0 and increments for each new gift
- `mapping(uint256 => Gift)` - A lookup table: give it an ID, get back a Gift
- The `public` keyword automatically creates a getter function

**Your Task:** Add these two state variables.

**Thinking Process:**
- Why an ID? Each gift needs a unique identifier so users can reference it
- Why a mapping? It's the most gas-efficient way to store and retrieve gifts by ID
- Starting from 0 means the first gift has ID 0, second has ID 1, etc.

---

## Step 6: Events

### 6.1 Why Events?

Events allow frontend applications to "listen" for things that happen in your contract. They're like notifications.

```solidity
event GiftCreated(
    uint256 indexed giftId,
    address indexed sender,
    address indexed recipient,
    uint256 unlockTime,
    AssetType assetType,
    address token,
    uint256 amount,
    string encryptedMessageURI
);

event GiftClaimed(
    uint256 indexed giftId,
    address indexed recipient,
    uint256 amount
);
```

**Understanding Events:**
- `indexed` parameters can be filtered in event logs (max 3 indexed params)
- When a gift is created, we emit `GiftCreated` with all its details
- When claimed, we emit `GiftClaimed` with the ID, recipient, and amount

**Your Task:** Define both events.

**Thinking Process:**
- Frontends need to know when gifts are created/claimed
- Indexed fields let users search event history efficiently
- Events cost gas but provide crucial off-chain information

---

## Step 7: Creating Gifts (ETH Version)

### 7.1 Function Signature

Let's create a function that accepts ETH and creates a gift:

```solidity
function createEthGift(
    address recipient,
    uint256 unlockTime,
    string calldata encryptedMessageURI
) external payable returns (uint256 giftId) {
```

**Breaking Down the Function:**
- `external` - Can only be called from outside the contract
- `payable` - Allows the function to receive ETH
- `returns (uint256 giftId)` - Returns the gift ID for the caller to use
- `calldata` - Gas-efficient for string parameters (read-only)

**Your Task:** Write the function signature.

---

### 7.2 Input Validation

Always validate inputs before processing:

```solidity
require(msg.value > 0, "No ETH sent");
require(recipient != address(0), "Invalid recipient");
require(unlockTime > block.timestamp, "Unlock must be in future");
```

**Why These Checks?**
- `msg.value > 0` - Ensures they actually sent ETH
- `recipient != address(0)` - Prevents sending to the zero address (invalid)
- `unlockTime > block.timestamp` - Unlock must be in the future (can't be already passed)

**Your Task:** Add these three require statements at the start of your function.

**Thinking Process:**
- Validation prevents errors and malicious behavior
- Clear error messages help users understand what went wrong
- Always validate before modifying state

---

### 7.3 Creating the Gift Record

Now we store the gift:

```solidity
giftId = nextGiftId++;
gifts[giftId] = Gift({
    sender: msg.sender,
    recipient: recipient,
    unlockTime: unlockTime,
    assetType: AssetType.NATIVE,
    token: address(0),
    amount: msg.value,
    encryptedMessageURI: encryptedMessageURI,
    claimed: false
});
```

**What's Happening?**
- `nextGiftId++` - Get current ID, then increment (first gift is 0, next is 1)
- We create a new `Gift` struct with all the information
- `msg.sender` is the address calling the function (the gift creator)
- `msg.value` is the amount of ETH sent with the transaction
- `AssetType.NATIVE` means this is ETH
- `address(0)` means no token (since it's ETH)

**Your Task:** Implement this gift creation logic.

**Thinking Process:**
- We increment the ID first, then use it immediately
- The ETH sent is automatically stored in the contract
- All gift data is saved to the `gifts` mapping

---

### 7.4 Emitting the Event

Don't forget to notify everyone:

```solidity
emit GiftCreated(
    giftId, msg.sender, recipient, unlockTime,
    AssetType.NATIVE, address(0), msg.value, encryptedMessageURI
);
```

**Your Task:** Add the event emission.

---

## Step 8: Creating Gifts (ERC-20 Token Version)

### 8.1 Function Signature

This function is similar but handles tokens:

```solidity
function createErc20Gift(
    address recipient,
    uint256 unlockTime,
    address token,
    uint256 amount,
    string calldata encryptedMessageURI
) external returns (uint256 giftId) {
```

**Key Differences:**
- No `payable` - we're not receiving ETH
- We need `token` - which ERC-20 token address
- We need `amount` - how many tokens

**Your Task:** Write the function signature.

---

### 8.2 Input Validation

Similar checks, but adapted for tokens:

```solidity
require(amount > 0, "No token amount");
require(recipient != address(0), "Invalid recipient");
require(unlockTime > block.timestamp, "Unlock must be in future");
require(token != address(0), "Invalid token");
```

**Your Task:** Add these validations.

---

### 8.3 Transferring Tokens

Here's the key part - we need to pull tokens from the sender:

```solidity
IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
```

**What's Happening?**
- `IERC20(token)` - Convert the address to an IERC20 interface
- `safeTransferFrom` - Safe version of `transferFrom` (from SafeERC20 library)
- Moves `amount` tokens from `msg.sender` to this contract
- **Important:** User must approve this contract first!

**Your Task:** Add the token transfer.

**Thinking Process:**
- Unlike ETH (sent automatically), tokens require explicit transfer
- `safeTransferFrom` handles edge cases (like tokens that don't return true)
- The contract now holds the tokens until claimed

---

### 8.4 Creating the Gift Record

Very similar to the ETH version, but with different values:

```solidity
giftId = nextGiftId++;
gifts[giftId] = Gift({
    sender: msg.sender,
    recipient: recipient,
    unlockTime: unlockTime,
    assetType: AssetType.ERC20,  // Different!
    token: token,                 // Different!
    amount: amount,               // Different!
    encryptedMessageURI: encryptedMessageURI,
    claimed: false
});
```

**Your Task:** Create the gift struct for ERC-20 gifts.

**Then emit the event** with ERC20 type and token address.

---

## Step 9: Claiming Gifts

### 9.1 Function Signature

The recipient claims their gift:

```solidity
function claim(uint256 giftId) external nonReentrant {
```

**Key Points:**
- `nonReentrant` - Uses ReentrancyGuard protection (prevents reentrancy attacks)
- Only needs the gift ID

**Your Task:** Write the function signature.

---

### 9.2 Getting the Gift

First, get a reference to the gift (more gas-efficient than copying):

```solidity
Gift storage g = gifts[giftId];
```

**Why `storage`?**
- `storage` means we're working with the actual stored data
- Changes to `g` will modify the original gift
- More efficient than copying (`memory`) when we need to modify it

**Your Task:** Create the storage reference.

---

### 9.3 Validation Checks

Multiple checks to ensure a valid claim:

```solidity
require(!g.claimed, "Already claimed");
require(msg.sender == g.recipient, "Not recipient");
require(block.timestamp >= g.unlockTime, "Too early");
```

**Why Each Check?**
- `!g.claimed` - Prevents claiming twice
- `msg.sender == g.recipient` - Only the intended recipient
- `block.timestamp >= g.unlockTime` - Must wait until unlock time

**Your Task:** Add all three checks.

**Thinking Process:**
- Security: We check everything before transferring funds
- Order matters: Check ownership before time (cheaper to fail early)

---

### 9.4 Marking as Claimed

Prevent double-claiming:

```solidity
g.claimed = true;
```

**Why First?**
- Set this before transferring (prevents reentrancy issues)
- If transfer fails, the transaction reverts anyway (so `claimed` reverts too)

**Your Task:** Mark the gift as claimed.

---

### 9.5 Transferring Assets

Now we transfer based on asset type:

```solidity
if (g.assetType == AssetType.NATIVE) {
    (bool ok, ) = payable(msg.sender).call{value: g.amount}("");
    require(ok, "ETH transfer failed");
} else {
    IERC20(g.token).safeTransfer(msg.sender, g.amount);
}
```

**Understanding ETH Transfer:**
- `payable(msg.sender).call{value: g.amount}("")` - Low-level call to send ETH
- `(bool ok, )` - Returns success status (ignore return data)
- `require(ok, ...)` - Revert if transfer failed

**Understanding Token Transfer:**
- `safeTransfer` - Uses our SafeERC20 library
- Sends tokens from contract to recipient

**Your Task:** Implement the conditional transfer logic.

**Thinking Process:**
- We check the asset type to determine transfer method
- ETH uses `.call()`, tokens use `safeTransfer()`
- Always check if ETH transfer succeeded

---

### 9.6 Emitting the Event

```solidity
emit GiftClaimed(giftId, msg.sender, g.amount);
```

**Your Task:** Add the event emission.

---

## Step 10: Helper View Function

### 10.1 Getting Gift Details

A simple view function for frontends:

```solidity
function getGift(uint256 giftId) external view returns (Gift memory) {
    return gifts[giftId];
}
```

**Why This?**
- Frontends can easily query gift details
- `view` means it doesn't modify state (free to call)
- Returns the entire Gift struct

**Your Task:** Implement this helper function.

---

## Step 11: Security Considerations Review

Let's review what we've done for security:

### ✅ What We Protected Against:

1. **Reentrancy Attacks**
   - Used `nonReentrant` modifier
   - Set `claimed = true` before transferring

2. **Invalid Inputs**
   - Checked amounts > 0
   - Validated addresses aren't zero
   - Ensured unlock time is in future

3. **Double Claiming**
   - `claimed` flag prevents multiple claims
   - Only recipient can claim

4. **Token Safety**
   - Used `SafeERC20` for token operations
   - Handles non-standard ERC-20 tokens

### 🤔 Things to Think About:

- **Gas Costs:** Creating and claiming gifts cost gas. Users must have ETH for gas.
- **Lost Keys:** If recipient loses their private key, they can never claim (by design - time lock, not recovery).
- **Frontrunning:** Someone could see a gift creation transaction and claim it first? No - only the recipient can claim.

---

## Step 12: Testing Your Understanding

### Questions to Consider:

1. What happens if someone tries to claim before `unlockTime`?
2. Can the sender cancel a gift? (Not in our current design - could you add this?)
3. What if the recipient never claims? (Assets stay locked forever)
4. How would you modify this to allow multiple recipients per gift?

---

## Next Steps: Deployment

Once your contract is complete:

1. **Compile** - Use Hardhat, Foundry, or Remix
2. **Test** - Write unit tests for all functions
3. **Deploy** - Deploy to a testnet first (Sepolia, Mumbai)
4. **Verify** - Verify source code on Etherscan
5. **Integrate** - Connect your frontend using the contract address

---

## Common Mistakes to Avoid

1. ❌ Forgetting to check `msg.value > 0` for ETH gifts
2. ❌ Not marking `claimed = true` before transferring
3. ❌ Using `transfer()` instead of `safeTransfer()` for tokens
4. ❌ Not validating addresses against `address(0)`
5. ❌ Missing `nonReentrant` modifier on the claim function

---

## Summary

You've built a complete time-locked gift contract! Here's what we covered:

- ✅ Contract structure and imports
- ✅ Enums and structs for data organization
- ✅ State variables and mappings
- ✅ Events for frontend integration
- ✅ ETH and ERC-20 token handling
- ✅ Time-locking mechanism
- ✅ Security best practices

**Congratulations!** You now understand how to build a production-ready smart contract with proper security measures.

---

## Additional Learning Resources

- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)
- [Solidity by Example](https://solidity-by-example.org/)
- [Ethereum Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

Happy building! 🚀

