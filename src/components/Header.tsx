import React from 'react';
import { Wallet, ChevronDown, ExternalLink, Copy, Check, Zap, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { NEURA_TESTNET } from '../config/contract';

export function Header() {
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    balance, 
    connect, 
    disconnect, 
    switchNetwork, 
    isLoading 
  } = useWeb3();
  
  const [copied, setCopied] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#9E7FFF] to-[#38bdf8] flex items-center justify-center glow-primary">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm"
                      style={{ 
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#AA96DA'][i] 
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#9E7FFF] via-[#38bdf8] to-[#f472b6] bg-clip-text text-transparent">
                Neura Pixel Board
              </h1>
              <p className="text-xs text-[#A3A3A3]">Fully Onchain Canvas</p>
            </div>
          </div>

          {/* Network & Wallet */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Network Badge */}
            {isConnected && (
              <button
                onClick={!isCorrectNetwork ? switchNetwork : undefined}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isCorrectNetwork 
                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30' 
                    : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 cursor-pointer hover:bg-[#ef4444]/20'
                }`}
              >
                {isCorrectNetwork ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    Neura Testnet
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Wrong Network
                  </>
                )}
              </button>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#9E7FFF]/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#9E7FFF] to-[#38bdf8] flex items-center justify-center">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-white">{formatAddress(account!)}</p>
                      <p className="text-xs text-[#A3A3A3]">{balance} ANKR</p>
                    </div>
                    <span className="sm:hidden text-sm font-medium">{formatAddress(account!)}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12121a] border border-[#2a2a3a] shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-[#2a2a3a]">
                      <p className="text-xs text-[#A3A3A3] mb-1">Connected Wallet</p>
                      <p className="text-sm font-mono text-white break-all">{account}</p>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={copyAddress}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a25] transition-colors text-left"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-[#10b981]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#A3A3A3]" />
                        )}
                        <span className="text-sm">{copied ? 'Copied!' : 'Copy Address'}</span>
                      </button>
                      
                      <a
                        href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${account}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a25] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[#A3A3A3]" />
                        <span className="text-sm">View on Explorer</span>
                      </a>
                      
                      {!isCorrectNetwork && (
                        <button
                          onClick={switchNetwork}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a25] transition-colors text-[#f59e0b]"
                        >
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Switch to Neura</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          disconnect();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#ef4444]/10 transition-colors text-[#ef4444]"
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm">Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
