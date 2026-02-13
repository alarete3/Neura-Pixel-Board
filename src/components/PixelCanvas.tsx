import React, { useState, useCallback, useMemo } from 'react';
import { numberToHex } from '../hooks/useContract';
import { GRID_SIZE } from '../config/contract';
import { Loader2 } from 'lucide-react';

interface PixelCanvasProps {
  pixels: Map<string, number>;
  selectedPixel: { x: number; y: number } | null;
  onPixelSelect: (x: number, y: number) => void;
  isLoading: boolean;
  isPainting: boolean;
  pendingPixel: { x: number; y: number; color: number } | null;
}

export function PixelCanvas({ 
  pixels, 
  selectedPixel, 
  onPixelSelect, 
  isLoading,
  isPainting,
  pendingPixel 
}: PixelCanvasProps) {
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate pixel size based on viewport
  const pixelSize = useMemo(() => {
    const baseSize = Math.min(window.innerWidth - 40, 600) / GRID_SIZE;
    return Math.max(4, Math.min(12, baseSize)) * zoom;
  }, [zoom]);

  const canvasSize = pixelSize * GRID_SIZE;

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Handle pixel click - ONLY selects, does NOT paint
  const handlePixelClick = useCallback((x: number, y: number) => {
    if (!isPainting) {
      onPixelSelect(x, y);
    }
  }, [isPainting, onPixelSelect]);

  // Render pixels - colors come ONLY from blockchain state
  const renderPixels = useMemo(() => {
    const pixelElements: React.ReactNode[] = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        // Get color from blockchain state ONLY
        const color = pixels.get(key) || 0;
        const isSelected = selectedPixel?.x === x && selectedPixel?.y === y;
        const isHovered = hoveredPixel?.x === x && hoveredPixel?.y === y;
        const isPendingPixel = pendingPixel?.x === x && pendingPixel?.y === y;
        
        // Display blockchain color - NO optimistic updates
        const bgColor = color === 0 ? '#1a1a25' : numberToHex(color);
        
        pixelElements.push(
          <div
            key={key}
            className={`pixel ${isSelected ? 'selected' : ''} ${isPendingPixel ? 'pending-pixel' : ''}`}
            style={{
              backgroundColor: bgColor,
              width: pixelSize,
              height: pixelSize,
              boxShadow: isHovered ? `0 0 ${pixelSize}px ${bgColor}` : 'none',
              cursor: isPainting ? 'wait' : 'crosshair',
            }}
            onClick={() => handlePixelClick(x, y)}
            onMouseEnter={() => setHoveredPixel({ x, y })}
            onMouseLeave={() => setHoveredPixel(null)}
          />
        );
      }
    }
    
    return pixelElements;
  }, [pixels, selectedPixel, hoveredPixel, pendingPixel, pixelSize, isPainting, handlePixelClick]);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute -top-12 right-0 flex items-center gap-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
          className="w-8 h-8 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center hover:border-[#9E7FFF]/50 transition-colors"
        >
          <span className="text-lg">+</span>
        </button>
        <span className="text-sm text-[#A3A3A3] min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
          className="w-8 h-8 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center hover:border-[#9E7FFF]/50 transition-colors"
        >
          <span className="text-lg">−</span>
        </button>
        <button
          onClick={resetView}
          className="px-3 h-8 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-sm hover:border-[#9E7FFF]/50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Coordinates display */}
      {hoveredPixel && (
        <div className="absolute -top-12 left-0 px-3 py-1 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-sm">
          <span className="text-[#A3A3A3]">Position: </span>
          <span className="text-[#9E7FFF] font-mono">({hoveredPixel.x}, {hoveredPixel.y})</span>
          {pixels.get(`${hoveredPixel.x},${hoveredPixel.y}`) ? (
            <>
              <span className="text-[#A3A3A3] ml-2">Color: </span>
              <span className="text-[#38bdf8] font-mono">
                {numberToHex(pixels.get(`${hoveredPixel.x},${hoveredPixel.y}`)!).toUpperCase()}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Canvas container */}
      <div 
        className="overflow-hidden rounded-2xl bg-[#0a0a0f] border border-[#2a2a3a] glow-primary"
        style={{ 
          width: Math.min(canvasSize + 2, window.innerWidth - 40),
          height: Math.min(canvasSize + 2, 600),
          cursor: isDragging ? 'grabbing' : 'crosshair',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="pixel-canvas"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${pixelSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${pixelSize}px)`,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            width: canvasSize,
            height: canvasSize,
          }}
        >
          {renderPixels}
        </div>
      </div>

      {/* Loading overlay - for initial pixel load */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#9E7FFF]" />
            <p className="text-sm text-[#A3A3A3]">Loading pixels from blockchain...</p>
          </div>
        </div>
      )}

      {/* Painting overlay */}
      {isPainting && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#12121a] border border-[#9E7FFF]/30">
            <Loader2 className="w-10 h-10 animate-spin text-[#9E7FFF]" />
            <p className="text-lg font-medium">Confirming Transaction...</p>
            <p className="text-sm text-[#A3A3A3]">Please wait for blockchain confirmation</p>
          </div>
        </div>
      )}
    </div>
  );
}
