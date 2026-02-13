import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PixelCanvas } from './components/PixelCanvas';
import { ColorPicker } from './components/ColorPicker';
import { StatsPanel } from './components/StatsPanel';
import { PaintButton } from './components/PaintButton';
import { ToastContainer, ToastData } from './components/Toast';
import { Footer } from './components/Footer';
import { useWeb3 } from './hooks/useWeb3';
import { useContract } from './hooks/useContract';
import { CONTRACT_ADDRESS } from './config/contract';

function App() {
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connect, 
    switchNetwork,
    provider,
    signer,
  } = useWeb3();

  const {
    pixels,
    stats,
    userCooldown,
    isLoadingPixels,
    isLoadingStats,
    isPainting,
    error: contractError,
    lastTxHash,
    loadAllPixels,
    loadStats,
    checkUserCooldown,
    paintPixel,
    formatPrice,
    getExplorerUrl,
  } = useContract(signer, provider, account, isCorrectNetwork);

  // UI State
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState(0x9E7FFF); // Default purple
  const [pendingPixel, setPendingPixel] = useState<{ x: number; y: number; color: number } | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Add toast helper
  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  // Remove toast helper
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load pixels from blockchain on mount and when network changes
  useEffect(() => {
    if (provider && isCorrectNetwork) {
      console.log('Loading pixels from blockchain...');
      loadAllPixels();
      loadStats();
    }
  }, [provider, isCorrectNetwork, loadAllPixels, loadStats]);

  // Check user cooldown periodically
  useEffect(() => {
    if (account && isCorrectNetwork) {
      checkUserCooldown();
      const interval = setInterval(checkUserCooldown, 1000);
      return () => clearInterval(interval);
    }
  }, [account, isCorrectNetwork, checkUserCooldown]);

  // Show contract errors as toasts
  useEffect(() => {
    if (contractError) {
      addToast({
        type: 'error',
        title: 'Error',
        message: contractError,
      });
    }
  }, [contractError, addToast]);

  // Handle pixel selection - ONLY selects, does NOT paint
  const handlePixelSelect = useCallback((x: number, y: number) => {
    if (!isPainting) {
      setSelectedPixel({ x, y });
    }
  }, [isPainting]);

  // Handle paint - Real blockchain transaction
  const handlePaint = useCallback(async () => {
    // Validate all prerequisites
    if (!selectedPixel) {
      addToast({
        type: 'warning',
        title: 'No Pixel Selected',
        message: 'Please click on a pixel to select it first.',
      });
      return;
    }

    if (!isConnected) {
      addToast({
        type: 'warning',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to paint.',
      });
      return;
    }

    if (!isCorrectNetwork) {
      addToast({
        type: 'warning',
        title: 'Wrong Network',
        message: 'Please switch to Neura Testnet.',
      });
      return;
    }

  
    const { x, y } = selectedPixel;
    
    // Set pending state for visual feedback (but NOT updating the actual pixel color)
    setPendingPixel({ x, y, color: selectedColor });

    try {
      addToast({
        type: 'info',
        title: 'Transaction Pending',
        message: `Opening MetaMask to paint pixel (${x}, ${y})...`,
        duration: 3000,
      });

      // This will open MetaMask and wait for confirmation
      const result = await paintPixel(x, y, selectedColor);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Pixel Painted!',
          message: `Successfully painted (${x}, ${y}) on the blockchain`,
          txHash: result.txHash,
          explorerUrl: getExplorerUrl(result.txHash),
          duration: 10000,
        });

        // Clear selection after successful paint
        setSelectedPixel(null);
      }
    } catch (err) {
      // Error already handled in useContract hook
      console.error('Paint failed:', err);
    } finally {
      setPendingPixel(null);
    }
  }, [selectedPixel, selectedColor, isConnected, isCorrectNetwork, paintPixel, getExplorerUrl, addToast]);

  // Refresh stats handler
  const handleRefreshStats = useCallback(() => {
    loadStats();
    checkUserCooldown();
  }, [loadStats, checkUserCooldown]);

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="animated-bg" />
      <div className="grid-pattern" />
      <div className="hex-pattern" />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            opacity: 0.1 + Math.random() * 0.2,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: ['#9E7FFF', '#38bdf8', '#f472b6', '#10b981'][Math.floor(Math.random() * 4)],
          }}
        />
      ))}

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <Hero />


          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Canvas - takes up most space */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <PixelCanvas
                pixels={pixels}
                selectedPixel={selectedPixel}
                onPixelSelect={handlePixelSelect}
                isLoading={isLoadingPixels}
                isPainting={isPainting}
                pendingPixel={pendingPixel}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Paint button */}
              <PaintButton
                selectedPixel={selectedPixel}
                selectedColor={selectedColor}
                pixelPrice={formatPrice(stats.pixelPrice)}
                canPaint={userCooldown.canPaint}
                cooldownRemaining={userCooldown.timeRemaining}
                isConnected={isConnected}
                isCorrectNetwork={isCorrectNetwork}
                isPainting={isPainting}
                onPaint={handlePaint}
                onConnect={connect}
                onSwitchNetwork={switchNetwork}
              />

              {/* Color picker */}
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />

              {/* Stats */}
              <StatsPanel
                pixelPrice={formatPrice(stats.pixelPrice)}
                totalPaints={stats.totalPaints}
                cooldownTime={stats.cooldownTime}
                userCooldown={userCooldown}
                isConnected={isConnected}
                isLoadingStats={isLoadingStats}
                onRefresh={handleRefreshStats}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
