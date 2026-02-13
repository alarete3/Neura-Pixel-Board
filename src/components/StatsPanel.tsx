import React, { useEffect, useState } from 'react';
import { Coins, Paintbrush, Clock, Activity, RefreshCw } from 'lucide-react';

interface StatsPanelProps {
  pixelPrice: string;
  totalPaints: number;
  cooldownTime: number;
  userCooldown: { canPaint: boolean; timeRemaining: number };
  isConnected: boolean;
  isLoadingStats: boolean;
  onRefresh: () => void;
}

export function StatsPanel({
  pixelPrice,
  totalPaints,
  cooldownTime,
  userCooldown,
  isConnected,
  isLoadingStats,
  onRefresh,
}: StatsPanelProps) {
  const [countdown, setCountdown] = useState(userCooldown.timeRemaining);

  useEffect(() => {
    setCountdown(userCooldown.timeRemaining);
    
    if (userCooldown.timeRemaining > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [userCooldown.timeRemaining]);

  const stats = [
    {
      icon: Coins,
      label: 'Pixel Price',
      value: `${pixelPrice} ANKR`,
      color: '#9E7FFF',
      description: 'Cost per pixel',
    },
    {
      icon: Paintbrush,
      label: 'Total Paints',
      value: totalPaints.toLocaleString(),
      color: '#38bdf8',
      description: 'All-time transactions',
    },
    {
      icon: Clock,
      label: 'Cooldown',
      value: `${cooldownTime}s`,
      color: '#f59e0b',
      description: 'Between paints',
    },
  ];

  return (
    <div className="glass-light rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#9E7FFF]" />
          <h3 className="font-semibold">Blockchain Stats</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoadingStats}
          className="p-2 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#9E7FFF]/50 transition-colors disabled:opacity-50"
          title="Refresh stats from blockchain"
        >
          <RefreshCw className={`w-4 h-4 text-[#A3A3A3] ${isLoadingStats ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card group"
          >
            <div className="flex items-start justify-between mb-2">
              <stat.icon 
                className="w-5 h-5 transition-colors" 
                style={{ color: stat.color }}
              />
            </div>
            <p className="text-lg sm:text-xl font-bold mb-0.5" style={{ color: stat.color }}>
              {isLoadingStats ? '...' : stat.value}
            </p>
            <p className="text-xs text-[#A3A3A3]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* User cooldown status */}
      {isConnected && (
        <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#A3A3A3]">Your Status</span>
            {userCooldown.canPaint || countdown === 0 ? (
              <span className="flex items-center gap-2 text-sm text-[#10b981]">
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Ready to paint
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-[#f59e0b]">
                <Clock className="w-4 h-4" />
                Wait {countdown}s
              </span>
            )}
          </div>
          
          {/* Progress bar for cooldown */}
          {!userCooldown.canPaint && countdown > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-[#1a1a25] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] transition-all duration-1000"
                style={{ width: `${((cooldownTime - countdown) / cooldownTime) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Network info */}
      <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span>Neura Testnet • Chain ID: 267</span>
        </div>
        <p className="text-xs text-[#666] mt-1">
          All data read directly from blockchain
        </p>
      </div>
    </div>
  );
}
