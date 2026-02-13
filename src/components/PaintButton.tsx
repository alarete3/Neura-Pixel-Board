import React from 'react';
import { Paintbrush, Loader2, AlertCircle, Wallet, Zap } from 'lucide-react';
import { numberToHex } from '../hooks/useContract';

interface PaintButtonProps {
  selectedPixel: { x: number; y: number } | null;
  selectedColor: number;
  pixelPrice: string;
  canPaint: boolean;
  cooldownRemaining: number;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isPainting: boolean;
  onPaint: () => void;
  onConnect: () => void;
  onSwitchNetwork: () => void;
}

export function PaintButton({
  selectedPixel,
  selectedColor,
  pixelPrice,
  canPaint,
  cooldownRemaining,
  isConnected,
  isCorrectNetwork,
  isPainting,
  onPaint,
  onConnect,
  onSwitchNetwork,
}: PaintButtonProps) {
  // Determine button state and content
  const getButtonContent = () => {
    if (!isConnected) {
      return {
        text: 'Connect Wallet to Paint',
        icon: Wallet,
        onClick: onConnect,
        disabled: false,
        className: 'bg-gradient-to-r from-[#9E7FFF] to-[#38bdf8]',
      };
    }

    if (!isCorrectNetwork) {
      return {
        text: 'Switch to Neura Testnet',
        icon: Zap,
        onClick: onSwitchNetwork,
        disabled: false,
        className: 'bg-gradient-to-r from-[#f59e0b] to-[#ef4444]',
      };
    }

    if (!selectedPixel) {
      return {
        text: 'Select a Pixel First',
        icon: AlertCircle,
        onClick: () => {},
        disabled: true,
        className: 'bg-[#2a2a3a]',
      };
    }

    if (!canPaint && cooldownRemaining > 0) {
      return {
        text: `Cooldown: ${cooldownRemaining}s`,
        icon: Loader2,
        onClick: () => {},
        disabled: true,
        className: 'bg-[#2a2a3a]',
      };
    }

    if (isPainting) {
      return {
        text: 'Waiting for Confirmation...',
        icon: Loader2,
        onClick: () => {},
        disabled: true,
        className: 'bg-gradient-to-r from-[#9E7FFF] to-[#38bdf8] opacity-70',
      };
    }

    return {
      text: `Confirm Paint (${pixelPrice} ANKR)`,
      icon: Paintbrush,
      onClick: onPaint,
      disabled: false,
      className: 'bg-gradient-to-r from-[#9E7FFF] to-[#38bdf8] hover:shadow-lg hover:shadow-[#9E7FFF]/30',
    };
  };

  const buttonState = getButtonContent();
  const IconComponent = buttonState.icon;

  return (
    <div className="glass-light rounded-2xl p-4 sm:p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Paintbrush className="w-5 h-5 text-[#9E7FFF]" />
        Paint Pixel
      </h3>

      {/* Selected pixel info */}
      {selectedPixel ? (
        <div className="mb-4 p-3 rounded-xl bg-[#0a0a0f] border border-[#9E7FFF]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#A3A3A3] mb-1">Selected Pixel</p>
              <p className="font-mono text-lg text-[#9E7FFF]">
                ({selectedPixel.x}, {selectedPixel.y})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-[#A3A3A3] mb-1">New Color</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border border-white/20"
                    style={{ backgroundColor: numberToHex(selectedColor) }}
                  />
                  <span className="font-mono text-sm">{numberToHex(selectedColor).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a] text-center">
          <p className="text-[#A3A3A3] text-sm">Click on a pixel to select it</p>
        </div>
      )}

      {/* Paint button */}
      <button
        onClick={buttonState.onClick}
        disabled={buttonState.disabled}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all ${buttonState.className} ${
          buttonState.disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <IconComponent className={`w-5 h-5 ${isPainting ? 'animate-spin' : ''}`} />
        {buttonState.text}
      </button>

      {/* Transaction info */}
      {isConnected && isCorrectNetwork && selectedPixel && !isPainting && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span>Gas Token</span>
            <span className="text-white">ANKR (Native)</span>
          </div>
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span>Pixel Cost</span>
            <span className="text-[#9E7FFF]">{pixelPrice} ANKR</span>
          </div>
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span>Network</span>
            <span className="text-[#10b981]">Neura Testnet</span>
          </div>
        </div>
      )}

      {/* Warning for painting */}
      {isPainting && (
        <div className="mt-4 p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
          <p className="text-sm text-[#f59e0b]">
            ⚠️ Do not close this page. Waiting for blockchain confirmation...
          </p>
        </div>
      )}

      {/* Help text */}
      {!isConnected && (
        <p className="mt-3 text-xs text-center text-[#A3A3A3]">
          Connect your wallet to paint pixels on the blockchain
        </p>
      )}
    </div>
  );
}
