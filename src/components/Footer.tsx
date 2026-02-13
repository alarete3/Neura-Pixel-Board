import React from 'react';
import { Github, Twitter, ExternalLink, Heart } from 'lucide-react';
import { CONTRACT_ADDRESS, NEURA_TESTNET } from '../config/contract';

export function Footer() {
  return (
    <footer className="mt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-light rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h4 className="font-semibold mb-3 text-white">About</h4>
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                Neura Pixel Board is a fully onchain collaborative canvas. Every pixel update is a real blockchain transaction on Neura Testnet.
              </p>
            </div>

            {/* Contract */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Smart Contract</h4>
              <div className="space-y-2">
                <a
                  href={`${NEURA_TESTNET.blockExplorerUrls[0]}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#9E7FFF] hover:text-[#38bdf8] transition-colors"
                >
                  <span className="font-mono truncate">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                <p className="text-xs text-[#666]">Verified on Neura Explorer</p>
              </div>
            </div>

            {/* Network */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Network</h4>
              <ul className="space-y-2 text-sm text-[#A3A3A3]">
                <li className="flex items-center justify-between">
                  <span>Chain</span>
                  <span className="text-white">Neura Testnet</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Chain ID</span>
                  <span className="text-white font-mono">267</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Token</span>
                  <span className="text-white">ANKR</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Links</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center hover:border-[#9E7FFF]/50 transition-colors"
                >
                  <Github className="w-5 h-5 text-[#A3A3A3]" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center hover:border-[#9E7FFF]/50 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-[#A3A3A3]" />
                </a>
                <a
                  href={NEURA_TESTNET.blockExplorerUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center hover:border-[#9E7FFF]/50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-[#A3A3A3]" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-6 border-t border-[#2a2a3a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#666] flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-[#f472b6]" /> for the Neura ecosystem
            </p>
            <p className="text-sm text-[#666]">
              © 2025 Neura Pixel Board. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
