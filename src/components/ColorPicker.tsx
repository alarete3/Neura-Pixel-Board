import React, { useState } from 'react';
import { Palette, Pipette } from 'lucide-react';
import { numberToHex, hexToNumber } from '../hooks/useContract';

interface ColorPickerProps {
  selectedColor: number;
  onColorChange: (color: number) => void;
}

const PRESET_COLORS = [
  // Row 1 - Reds & Pinks
  0xFF0000, 0xFF4444, 0xFF6B6B, 0xF38181, 0xFFB6C1, 0xFFC0CB, 0xFF69B4, 0xFF1493,
  // Row 2 - Oranges & Yellows
  0xFF8C00, 0xFFA500, 0xFFD700, 0xFFE66D, 0xFFFF00, 0xF0E68C, 0xFAFAD2, 0xFFEFD5,
  // Row 3 - Greens
  0x00FF00, 0x32CD32, 0x90EE90, 0x95E1D3, 0x10B981, 0x2E8B57, 0x006400, 0x228B22,
  // Row 4 - Cyans & Blues
  0x00FFFF, 0x4ECDC4, 0x38BDF8, 0x00BFFF, 0x1E90FF, 0x0000FF, 0x4169E1, 0x000080,
  // Row 5 - Purples
  0x9E7FFF, 0x8B5CF6, 0xAA96DA, 0x9370DB, 0x8A2BE2, 0x9400D3, 0x800080, 0x4B0082,
  // Row 6 - Browns & Neutrals
  0xA52A2A, 0xD2691E, 0xCD853F, 0xDEB887, 0xF5DEB3, 0xFFE4C4, 0xFAF0E6, 0xFFFAF0,
  // Row 7 - Grays
  0x000000, 0x1a1a1a, 0x333333, 0x555555, 0x777777, 0x999999, 0xBBBBBB, 0xFFFFFF,
  // Row 8 - Special
  0xA8D8EA, 0xFCBAD3, 0xAA96DA, 0xFFFFE0, 0xE6E6FA, 0xF0FFF0, 0xFFF0F5, 0xF5F5DC,
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customColor, setCustomColor] = useState(numberToHex(selectedColor));

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColor(hex);
    onColorChange(hexToNumber(hex));
  };

  const handlePresetClick = (color: number) => {
    onColorChange(color);
    setCustomColor(numberToHex(color));
  };

  return (
    <div className="glass-light rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#9E7FFF]" />
          <h3 className="font-semibold">Color Palette</h3>
        </div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
            showCustom 
              ? 'bg-[#9E7FFF]/20 text-[#9E7FFF] border border-[#9E7FFF]/30' 
              : 'bg-[#1a1a25] text-[#A3A3A3] border border-[#2a2a3a] hover:border-[#9E7FFF]/30'
          }`}
        >
          <Pipette className="w-4 h-4" />
          Custom
        </button>
      </div>

      {/* Selected color preview */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a]">
        <div 
          className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: numberToHex(selectedColor) }}
        />
        <div>
          <p className="text-sm text-[#A3A3A3]">Selected Color</p>
          <p className="font-mono text-lg">{numberToHex(selectedColor).toUpperCase()}</p>
        </div>
      </div>

      {/* Custom color picker */}
      {showCustom && (
        <div className="mb-4 p-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a]">
          <label className="block text-sm text-[#A3A3A3] mb-2">Custom Color</label>
          <div className="flex items-center gap-3">
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={customColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  setCustomColor(val);
                  if (val.length === 7) {
                    onColorChange(hexToNumber(val));
                  }
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] font-mono text-sm focus:outline-none focus:border-[#9E7FFF]/50"
              placeholder="#FF0000"
            />
          </div>
        </div>
      )}

      {/* Preset colors grid */}
      <div className="grid grid-cols-8 gap-1.5">
        {PRESET_COLORS.map((color, index) => (
          <button
            key={index}
            onClick={() => handlePresetClick(color)}
            className={`aspect-square rounded-lg transition-all hover:scale-110 hover:z-10 ${
              selectedColor === color 
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12121a] scale-110 z-10' 
                : ''
            }`}
            style={{ 
              backgroundColor: numberToHex(color),
              boxShadow: selectedColor === color ? `0 0 20px ${numberToHex(color)}` : 'none'
            }}
            title={numberToHex(color).toUpperCase()}
          />
        ))}
      </div>

      {/* Help text */}
      <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
        <p className="text-xs text-[#A3A3A3] mb-2">How to Paint</p>
        <ul className="text-xs text-[#666] space-y-1">
          <li>1. Click a pixel on the canvas to select it</li>
          <li>2. Choose a color from the palette above</li>
          <li>3. Click "Confirm Paint" button</li>
          <li>4. Approve transaction in MetaMask</li>
          <li>5. Wait for blockchain confirmation</li>
        </ul>
      </div>
    </div>
  );
}
