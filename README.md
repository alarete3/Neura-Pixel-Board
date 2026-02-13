# Neura Pixel Board - Fully Onchain Canvas

A production-ready Web3 dApp deployed on Neura Testnet where every pixel update is a real blockchain transaction.

![Neura Pixel Board](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop)

## 🎨 Overview

Neura Pixel Board is a collaborative onchain canvas where users can paint pixels using ANKR (the native gas token). Every pixel is stored directly on the blockchain, making the artwork fully verifiable and permanent.

## ✨ Features

- **64x64 Pixel Canvas** - 4,096 paintable pixels
- **Fully Onchain** - All pixel data stored in smart contract
- **Real Transactions** - Every paint is a blockchain transaction
- **Native ANKR Payments** - Uses the native gas token
- **5-Second Cooldown** - Prevents spam while allowing active participation
- **Color Picker** - 64 preset colors + custom color support
- **Real-time Updates** - See changes as they happen
- **Wallet Integration** - MetaMask and other Web3 wallets supported
- **Network Auto-Switch** - Prompts to switch to Neura Testnet

## 🔗 Contract Details

- **Network**: Neura Testnet
- **Chain ID**: 267
- **Contract Address**: `0x0000000000000000000000000000000000000000` (Replace with deployed address)
- **Pixel Price**: 0.001 ANKR
- **Cooldown**: 5 seconds

## 🛠 Smart Contract

The contract is written in pure Solidity with no external dependencies:

- No OpenZeppelin imports
- No external libraries
- Manual Ownable implementation
- ReentrancyGuard protection
- Pause functionality
- Batch pixel reading for efficient loading

### Key Functions

```solidity
// Paint a pixel
function paintPixel(uint256 x, uint256 y, uint24 color) external payable

// Get pixel color
function getPixel(uint256 x, uint256 y) external view returns (uint24)

// Get batch of pixels
function getPixelBatch(uint256 startX, uint256 startY, uint256 endX, uint256 endY) external view returns (uint24[])

// Check if user can paint
function canUserPaint(address user) external view returns (bool canPaint, uint256 timeRemaining)
```

### Events

```solidity
event PixelPainted(address indexed user, uint256 x, uint256 y, uint24 color)
event PriceUpdated(uint256 newPrice)
event Paused(bool isPaused)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- ANKR tokens on Neura Testnet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/neura-pixel-board

# Install dependencies
npm install

# Start development server
npm run dev
```

### Network Configuration

Add Neura Testnet to your wallet:

| Parameter | Value |
|-----------|-------|
| Network Name | Neura Testnet |
| RPC URL | https://rpc.ankr.com/neura_testnet |
| Chain ID | 267 |
| Currency Symbol | ANKR |
| Block Explorer | https://explorer.neura.network |

## 📁 Project Structure

```
├── contracts/
│   └── NeuraPixelBoard.sol    # Smart contract
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Navigation & wallet
│   │   ├── Hero.tsx           # Landing section
│   │   ├── PixelCanvas.tsx    # Main canvas
│   │   ├── ColorPicker.tsx    # Color selection
│   │   ├── StatsPanel.tsx     # Contract stats
│   │   ├── PaintButton.tsx    # Paint action
│   │   ├── Toast.tsx          # Notifications
│   │   └── Footer.tsx         # Footer
│   ├── hooks/
│   │   ├── useWeb3.ts         # Wallet connection
│   │   └── useContract.ts     # Contract interaction
│   ├── App.tsx                # Main app
│   └── index.css              # Styles
└── README.md
```

## 🎯 How to Use

1. **Connect Wallet** - Click "Connect Wallet" and approve the connection
2. **Switch Network** - If prompted, switch to Neura Testnet
3. **Select Pixel** - Click any pixel on the canvas
4. **Choose Color** - Pick from presets or use custom color
5. **Paint** - Click "Paint Pixel" and confirm the transaction
6. **Wait** - Transaction confirms in ~2-3 seconds
7. **Repeat** - Wait 5 seconds cooldown, then paint again!

## 🔒 Security

- **Bounds Checking** - Validates x/y coordinates
- **Reentrancy Protection** - Prevents reentrancy attacks
- **Pause Mechanism** - Owner can pause in emergencies
- **Cooldown System** - Prevents spam attacks
- **Payment Validation** - Ensures correct payment amount

## 📊 Economics

| Parameter | Value |
|-----------|-------|
| Pixel Price | 0.001 ANKR |
| Cooldown | 5 seconds |
| Canvas Size | 64x64 (4,096 pixels) |
| Max Cost to Fill | 4.096 ANKR |

## 🌐 Links

- **Demo**: [Live Demo URL]
- **Contract**: [Explorer Link]
- **Faucet**: [Neura Testnet Faucet]

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

Built with ❤️ for the Neura ecosystem
