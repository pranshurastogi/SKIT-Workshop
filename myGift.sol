// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GiftBox
 * @notice Time-locked gifts of ETH or ERC-20 tokens for a specific recipient.
 *         Message privacy is handled by storing an *encrypted* message URI (e.g., ipfs://CID).
 */
contract GiftBox is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum AssetType { NATIVE, ERC20 }

    struct Gift {
        address sender;
        address recipient;
        uint256 unlockTime;         // unix timestamp
        AssetType assetType;
        address token;              // ERC-20 token address if assetType=ERC20, else address(0)
        uint256 amount;             // amount of ETH or tokens
        string encryptedMessageURI; // e.g., ipfs://... (ciphertext or sealed box)
        bool claimed;
    }

    uint256 public nextGiftId;
    mapping(uint256 => Gift) public gifts;

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

    /**
     * @notice Create a gift funded with native ETH.
     * @param recipient Receiver of the gift
     * @param unlockTime Earliest timestamp when recipient can claim
     * @param encryptedMessageURI URI to encrypted payload (e.g., ipfs://CID)
     */
    function createEthGift(
        address recipient,
        uint256 unlockTime,
        string calldata encryptedMessageURI
    ) external payable returns (uint256 giftId) {
        require(msg.value > 0, "No ETH sent");
        require(recipient != address(0), "Invalid recipient");
        require(unlockTime > block.timestamp, "Unlock must be in future");

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

        emit GiftCreated(
            giftId, msg.sender, recipient, unlockTime,
            AssetType.NATIVE, address(0), msg.value, encryptedMessageURI
        );
    }

    /**
     * @notice Create a gift funded with ERC-20 tokens.
     * @dev Sender must approve this contract for `amount` beforehand.
     */
    function createErc20Gift(
        address recipient,
        uint256 unlockTime,
        address token,
        uint256 amount,
        string calldata encryptedMessageURI
    ) external returns (uint256 giftId) {
        require(amount > 0, "No token amount");
        require(recipient != address(0), "Invalid recipient");
        require(unlockTime > block.timestamp, "Unlock must be in future");
        require(token != address(0), "Invalid token");

        // Pull tokens into contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        giftId = nextGiftId++;
        gifts[giftId] = Gift({
            sender: msg.sender,
            recipient: recipient,
            unlockTime: unlockTime,
            assetType: AssetType.ERC20,
            token: token,
            amount: amount,
            encryptedMessageURI: encryptedMessageURI,
            claimed: false
        });

        emit GiftCreated(
            giftId, msg.sender, recipient, unlockTime,
            AssetType.ERC20, token, amount, encryptedMessageURI
        );
    }

    /**
     * @notice Claim the gift after unlock time (recipient only).
     */
    function claim(uint256 giftId) external nonReentrant {
        Gift storage g = gifts[giftId];
        require(!g.claimed, "Already claimed");
        require(msg.sender == g.recipient, "Not recipient");
        require(block.timestamp >= g.unlockTime, "Too early");

        g.claimed = true;

        if (g.assetType == AssetType.NATIVE) {
            (bool ok, ) = payable(msg.sender).call{value: g.amount}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(g.token).safeTransfer(msg.sender, g.amount);
        }

        emit GiftClaimed(giftId, msg.sender, g.amount);
    }

    /**
     * @notice Helper view for frontends.
     */
    function getGift(uint256 giftId) external view returns (Gift memory) {
        return gifts[giftId];
    }
}

