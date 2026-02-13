import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { JsonRpcSigner, BrowserProvider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, GRID_SIZE, NEURA_TESTNET, DEFAULT_PIXEL_PRICE } from '../config/contract';

interface ContractStats {
  pixelPrice: bigint;
  totalPaints: number;
  cooldownTime: number;
  isPaused: boolean;
}

interface UserCooldown {
  canPaint: boolean;
  timeRemaining: number;
}

interface UseContractReturn {
  // State
  pixels: Map<string, number>;
  stats: ContractStats;
  userCooldown: UserCooldown;
  isLoadingPixels: boolean;
  isLoadingStats: boolean;
  isPainting: boolean;
  error: string | null;
  lastTxHash: string | null;
  
  // Actions
  loadAllPixels: () => Promise<void>;
  loadStats: () => Promise<void>;
  checkUserCooldown: () => Promise<void>;
  paintPixel: (x: number, y: number, color: number) => Promise<{ success: boolean; txHash: string }>;
  
  // Helpers
  formatPrice: (priceWei: bigint) => string;
  getExplorerUrl: (hash: string) => string;
}

export function useContract(
  signer: JsonRpcSigner | null,
  provider: BrowserProvider | null,
  account: string | null,
  isCorrectNetwork: boolean
): UseContractReturn {
  // Pixel state - ONLY from blockchain
  const [pixels, setPixels] = useState<Map<string, number>>(new Map());
  const [isLoadingPixels, setIsLoadingPixels] = useState(false);
  
  // Contract stats
  const [stats, setStats] = useState<ContractStats>({
    pixelPrice: BigInt(DEFAULT_PIXEL_PRICE),
    totalPaints: 0,
    cooldownTime: 5,
    isPaused: false,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // User state
  const [userCooldown, setUserCooldown] = useState<UserCooldown>({ canPaint: true, timeRemaining: 0 });
  
  // Transaction state
  const [isPainting, setIsPainting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  
  // Contract instance ref
  const contractRef = useRef<Contract | null>(null);
  const readContractRef = useRef<Contract | null>(null);

  // Initialize read-only contract (for reading without signer)
  useEffect(() => {
    if (provider && isCorrectNetwork) {
      readContractRef.current = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } else {
      readContractRef.current = null;
    }
  }, [provider, isCorrectNetwork]);

  // Initialize write contract (with signer)
  useEffect(() => {
    if (signer && isCorrectNetwork) {
      contractRef.current = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } else {
      contractRef.current = null;
    }
  }, [signer, isCorrectNetwork]);

  // Load ALL pixels from blockchain
  const loadAllPixels = useCallback(async () => {
    if (!readContractRef.current) {
      console.log('No contract available for reading pixels');
      return;
    }

    setIsLoadingPixels(true);
    setError(null);

    try {
      console.log('Loading all pixels from blockchain...');
      const newPixels = new Map<string, number>();
      
      // Load pixels in batches to avoid timeout
      const batchSize = 16; // 16x16 = 256 pixels per batch
      
      for (let startY = 0; startY < GRID_SIZE; startY += batchSize) {
        for (let startX = 0; startX < GRID_SIZE; startX += batchSize) {
          const endX = Math.min(startX + batchSize, GRID_SIZE);
          const endY = Math.min(startY + batchSize, GRID_SIZE);
          
          try {
            const colors = await readContractRef.current.getPixelBatch(startX, startY, endX, endY);
            
            let index = 0;
            for (let y = startY; y < endY; y++) {
              for (let x = startX; x < endX; x++) {
                const color = Number(colors[index]);
                if (color !== 0) {
                  newPixels.set(`${x},${y}`, color);
                }
                index++;
              }
            }
          } catch (batchError) {
            console.error(`Failed to load batch (${startX},${startY}) to (${endX},${endY}):`, batchError);
            // Continue with other batches
          }
        }
      }
      
      console.log(`Loaded ${newPixels.size} colored pixels from blockchain`);
      setPixels(newPixels);
    } catch (err) {
      console.error('Failed to load pixels:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pixels from blockchain');
    } finally {
      setIsLoadingPixels(false);
    }
  }, []);

  // Load single pixel from blockchain
  const loadSinglePixel = useCallback(async (x: number, y: number) => {
    if (!readContractRef.current) return;

    try {
      const color = await readContractRef.current.getPixel(x, y);
      const colorNum = Number(color);
      
      setPixels(prev => {
        const newPixels = new Map(prev);
        if (colorNum === 0) {
          newPixels.delete(`${x},${y}`);
        } else {
          newPixels.set(`${x},${y}`, colorNum);
        }
        return newPixels;
      });
      
      console.log(`Loaded pixel (${x},${y}) = ${colorNum.toString(16)}`);
    } catch (err) {
      console.error(`Failed to load pixel (${x},${y}):`, err);
    }
  }, []);

  // Load contract stats
  const loadStats = useCallback(async () => {
    if (!readContractRef.current) return;

    setIsLoadingStats(true);

    try {
      const [pixelPrice, totalPaints, cooldownTime, isPaused] = await Promise.all([
        readContractRef.current.getPixelPrice(),
        readContractRef.current.totalPaints(),
        readContractRef.current.cooldownTime(),
        readContractRef.current.paused(),
      ]);

      setStats({
        pixelPrice: BigInt(pixelPrice.toString()),
        totalPaints: Number(totalPaints),
        cooldownTime: Number(cooldownTime),
        isPaused: Boolean(isPaused),
      });
      
      console.log('Contract stats loaded:', {
        pixelPrice: formatEther(pixelPrice),
        totalPaints: Number(totalPaints),
        cooldownTime: Number(cooldownTime),
        isPaused: Boolean(isPaused),
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Check user cooldown
  const checkUserCooldown = useCallback(async () => {
    if (!readContractRef.current || !account) {
      setUserCooldown({ canPaint: true, timeRemaining: 0 });
      return;
    }

    try {
      const result = await readContractRef.current.canUserPaint(account);
      setUserCooldown({
        canPaint: Boolean(result.canPaint),
        timeRemaining: Number(result.timeRemaining),
      });
    } catch (err) {
      console.error('Failed to check cooldown:', err);
      setUserCooldown({ canPaint: true, timeRemaining: 0 });
    }
  }, [account]);

  // PAINT PIXEL - Real blockchain transaction
  const paintPixel = useCallback(async (
    x: number,
    y: number,
    color: number
  ): Promise<{ success: boolean; txHash: string }> => {
    // Validate prerequisites
    if (!contractRef.current) {
      throw new Error('Contract not initialized. Please connect wallet and switch to Neura Testnet.');
    }

    if (!signer) {
      throw new Error('Wallet not connected');
    }

    if (!isCorrectNetwork) {
      throw new Error('Please switch to Neura Testnet');
    }

    if (!account) {
      throw new Error('No account connected');
    }

    // Validate bounds
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      throw new Error('Coordinates out of bounds');
    }

    // Validate color
    if (color < 0 || color > 0xFFFFFF) {
      throw new Error('Invalid color value');
    }

    setIsPainting(true);
    setError(null);
    setLastTxHash(null);

    try {
      console.log(`Painting pixel (${x}, ${y}) with color #${color.toString(16).padStart(6, '0')}`);
      console.log(`Pixel price: ${formatEther(stats.pixelPrice)} ANKR`);

      // Call the contract - this will open MetaMask
      const tx = await contractRef.current.paintPixel(x, y, color, {
        value: stats.pixelPrice,
      });

      console.log('Transaction submitted:', tx.hash);
      setLastTxHash(tx.hash);

      // Wait for confirmation - DO NOT update UI until confirmed
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction reverted');
      }

      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // NOW read the pixel from blockchain to update UI
      await loadSinglePixel(x, y);
      
      // Reload stats (total paints changed)
      await loadStats();
      
      // Update cooldown
      await checkUserCooldown();

      return { success: true, txHash: tx.hash };
    } catch (err: unknown) {
      console.error('Paint transaction failed:', err);
      
      let errorMessage = 'Transaction failed';
      
      if (err instanceof Error) {
        // Parse common errors
        if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ANKR balance';
        } else if (err.message.includes('COOLDOWN_ACTIVE')) {
          errorMessage = 'Cooldown active. Please wait.';
        } else if (err.message.includes('PAUSED')) {
          errorMessage = 'Contract is paused';
        } else if (err.message.includes('INSUFFICIENT_PAYMENT')) {
          errorMessage = 'Insufficient payment amount';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPainting(false);
    }
  }, [signer, isCorrectNetwork, account, stats.pixelPrice, loadSinglePixel, loadStats, checkUserCooldown]);

  // Set up event listener for PixelPainted events
  useEffect(() => {
    if (!readContractRef.current) return;

    const handlePixelPainted = (user: string, x: bigint, y: bigint, color: bigint) => {
      const xNum = Number(x);
      const yNum = Number(y);
      const colorNum = Number(color);
      
      console.log(`PixelPainted event: (${xNum}, ${yNum}) = #${colorNum.toString(16).padStart(6, '0')} by ${user}`);
      
      // Update the pixel in state
      setPixels(prev => {
        const newPixels = new Map(prev);
        if (colorNum === 0) {
          newPixels.delete(`${xNum},${yNum}`);
        } else {
          newPixels.set(`${xNum},${yNum}`, colorNum);
        }
        return newPixels;
      });
      
      // Reload stats
      loadStats();
    };

    // Subscribe to events
    readContractRef.current.on('PixelPainted', handlePixelPainted);
    console.log('Subscribed to PixelPainted events');

    return () => {
      if (readContractRef.current) {
        readContractRef.current.off('PixelPainted', handlePixelPainted);
        console.log('Unsubscribed from PixelPainted events');
      }
    };
  }, [loadStats, provider, isCorrectNetwork]);

  // Format price helper
  const formatPrice = useCallback((priceWei: bigint): string => {
    return formatEther(priceWei);
  }, []);

  // Get explorer URL
  const getExplorerUrl = useCallback((hash: string): string => {
    return `${NEURA_TESTNET.blockExplorerUrls[0]}/tx/${hash}`;
  }, []);

  return {
    pixels,
    stats,
    userCooldown,
    isLoadingPixels,
    isLoadingStats,
    isPainting,
    error,
    lastTxHash,
    loadAllPixels,
    loadStats,
    checkUserCooldown,
    paintPixel,
    formatPrice,
    getExplorerUrl,
  };
}

// Helper to convert hex color to number
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

// Helper to convert number to hex color
export function numberToHex(num: number): string {
  return '#' + num.toString(16).padStart(6, '0');
}
