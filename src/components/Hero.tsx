import React from 'react';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative text-center mb-8 sm:mb-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#9E7FFF]/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-[#38bdf8]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9E7FFF]/10 border border-[#9E7FFF]/20 mb-6">
          <Sparkles className="w-4 h-4 text-[#9E7FFF]" />
          <span className="text-sm text-[#9E7FFF] font-medium">100% Onchain • Neura Testnet</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#9E7FFF] via-[#38bdf8] to-[#f472b6] bg-clip-text text-transparent">
            Neura Pixel Board
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#A3A3A3] max-w-2xl mx-auto mb-8">
          Every pixel is a <span className="text-[#9E7FFF]">real blockchain transaction</span>. 
          Paint, collaborate, and create art that lives forever onchain.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-sm text-[#A3A3A3]">
            <div className="w-8 h-8 rounded-lg bg-[#9E7FFF]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#9E7FFF]" />
            </div>
            <span>Real Transactions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#A3A3A3]">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <span>Fully Verifiable</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#A3A3A3]">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#10b981]" />
            </div>
            <span>Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
