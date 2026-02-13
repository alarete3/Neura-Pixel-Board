// Contract Configuration for Neura Pixel Board
// IMPORTANT: Update CONTRACT_ADDRESS after deploying the contract

export const CONTRACT_ADDRESS = '0x74CaC1793914e7Cd2ea583D563da82de5c09e169'; // TODO: Replace with deployed address

export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: '0x10b',
  chainName: 'Neura Testnet',
  nativeCurrency: {
    name: 'ANKR',
    symbol: 'ANKR',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ankr.com/neura_testnet'],
  blockExplorerUrls: ['https://explorer.neura.network'],
};

// Contract ABI - Only the functions we need
export const CONTRACT_ABI = [
  // Read functions
  'function getPixel(uint256 x, uint256 y) view returns (uint24)',
  'function getPixelBatch(uint256 startX, uint256 startY, uint256 endX, uint256 endY) view returns (uint24[])',
  'function getPixelPrice() view returns (uint256)',
  'function totalPaints() view returns (uint256)',
  'function canUserPaint(address user) view returns (bool canPaint, uint256 timeRemaining)',
  'function paused() view returns (bool)',
  'function cooldownTime() view returns (uint256)',
  'function getBoardSize() view returns (uint256 width, uint256 height)',
  
  // Write functions
  'function paintPixel(uint256 x, uint256 y, uint24 color) payable',
  
  // Events
  'event PixelPainted(address indexed user, uint256 x, uint256 y, uint24 color)',
];

export const GRID_SIZE = 64;
export const DEFAULT_PIXEL_PRICE = '1000000000000000'; // 0.001 ANKR in wei
