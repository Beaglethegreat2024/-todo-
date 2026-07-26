import React from 'react';
import { BeadPet, GachaItem } from '../types';
import { GACHA_ITEMS } from '../data';

interface BeadPetRendererProps {
  pet: BeadPet;
  animationState: 'idle' | 'float' | 'bounce' | 'wave';
  size?: number; // Overall container size in pixels (default 240)
  interactive?: boolean;
  onBeadClick?: (x: number, y: number) => void;
  showBeadReflection?: boolean;
  status?: 'normal' | 'sleeping' | 'hungry' | 'fainted';
}

export default function BeadPetRenderer({
  pet,
  animationState,
  size = 240,
  interactive = false,
  onBeadClick,
  showBeadReflection = true,
  status = 'normal',
}: BeadPetRendererProps) {
  const { beadGrid, gridSize, activeOutfitId, originalImage, useOriginalImage } = pet;

  // Find active outfit/accessory
  const activeOutfit = GACHA_ITEMS.find((item) => item.id === activeOutfitId);

  // Setup animation class
  let animationClass = '';
  if (status === 'fainted') {
    animationClass = 'rotate-[85deg] translate-y-6 translate-x-1.5 grayscale-[40%] transition-all duration-500 duration-1000';
  } else if (status === 'sleeping') {
    animationClass = 'animate-breathe origin-bottom opacity-95 scale-y-[0.97] transition-all duration-500';
  } else {
    switch (animationState) {
      case 'float':
        animationClass = 'animate-float-slow';
        break;
      case 'bounce':
        animationClass = 'animate-bounce-slow';
        break;
      case 'wave':
        animationClass = 'animate-breathe origin-bottom';
        break;
      case 'idle':
      default:
        animationClass = 'hover:scale-[1.02] transition-transform duration-300';
    }
  }

  // Render individual perler beads or pixel squares or original image
  const renderBeadGrid = () => {
    if (useOriginalImage && originalImage) {
      return (
        <div
          className="relative w-full h-full rounded-2xl border-4 border-[#2d3436] bg-white overflow-hidden shadow-[4px_4px_0_#2d3436] p-1 flex items-center justify-center group/img"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <img
            src={originalImage}
            alt={pet.name}
            className="w-full h-full object-contain rounded-xl select-none"
            referrerPolicy="no-referrer"
          />
          {/* Subtle cute inner dash line like a sticker cut-out */}
          <div className="absolute inset-1 border-2 border-dashed border-[#2d3436]/20 pointer-events-none rounded-xl" />
        </div>
      );
    }

    return (
      <div
        className="grid gap-[1.5px] p-2 bg-slate-950/40 rounded-xl border border-slate-800/30 shadow-inner overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {beadGrid.map((row, y) =>
          row.map((cell, x) => {
            if (cell === null) {
              return <div key={`${y}-${x}`} className="w-full h-full" />;
            }
            return (
              <div
                key={`${y}-${x}`}
                onClick={() => interactive && onBeadClick?.(x, y)}
                className={`w-full h-full ${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : ''} ${
                  showBeadReflection ? 'bead-pixel' : 'rounded-sm'
                }`}
                style={{
                  backgroundColor: cell,
                }}
                title={interactive ? `Pixel at X:${x}, Y:${y} - ${cell}` : undefined}
              />
            );
          })
        )}
      </div>
    );
  };

  // Helper to render dress-up outfits overlaying the pixel-grid
  const renderOutfitOverlay = () => {
    if (!activeOutfit) return null;

    // Determine position based on item category
    let positionClass = '';
    let extraStyle: React.CSSProperties = {};

    switch (activeOutfit.assetType) {
      case 'hat':
        // Sit nicely on top of head
        positionClass = 'absolute -top-6 left-1/2 -translate-x-1/2 text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] select-none pointer-events-none z-10';
        break;
      case 'glasses':
        // Positioned where eyes typically reside
        positionClass = 'absolute top-[28%] left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none pointer-events-none z-20';
        break;
      case 'accessory':
        if (activeOutfit.id === 'wing_angel') {
          // Angel wings go slightly behind the pet
          positionClass = 'absolute top-[20%] left-1/2 -translate-x-1/2 text-6xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] select-none pointer-events-none z-[-1] opacity-90 animate-pulse';
        } else if (activeOutfit.id === 'item_boba' || activeOutfit.id === 'item_gamepad') {
          // Boba or gamepad goes at the bottom-right corner as if held
          positionClass = 'absolute bottom-2 -right-4 text-4xl filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] select-none pointer-events-none z-15';
        } else {
          positionClass = 'absolute -top-4 -right-4 text-4xl filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] select-none pointer-events-none z-10';
        }
        break;
      case 'clothing':
        // Scarf or clothing sits on neck/chest
        positionClass = 'absolute bottom-[10%] left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] select-none pointer-events-none z-15';
        break;
      default:
        positionClass = 'absolute top-0 right-0 text-3xl select-none pointer-events-none';
    }

    return (
      <div className={positionClass} style={extraStyle}>
        {activeOutfit.icon}
      </div>
    );
  };

  return (
    <div
      className={`relative inline-block ${animationClass}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 3D shadow under floating/bouncing pets */}
      {status !== 'fainted' && (animationState === 'float' || animationState === 'bounce') && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-black/30 blur-sm rounded-full transform scale-x-90 transition-all duration-300 animate-pulse" />
      )}

      {/* Main Bead grid representing pet */}
      {renderBeadGrid()}

      {/* Outfit Accessories overlay */}
      {renderOutfitOverlay()}

      {/* Sleeping Particles */}
      {status === 'sleeping' && (
        <div className="absolute -top-8 right-2 select-none pointer-events-none z-30 flex flex-col font-black text-[#54a0ff] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
          <span className="text-xl animate-bounce inline-block" style={{ animationDelay: '0ms', animationDuration: '2.5s' }}>Z</span>
          <span className="text-base absolute -top-4 left-4 animate-bounce inline-block" style={{ animationDelay: '500ms', animationDuration: '2.5s' }}>z</span>
          <span className="text-xs absolute -top-7 left-8 animate-bounce inline-block" style={{ animationDelay: '1000ms', animationDuration: '2.5s' }}>z</span>
        </div>
      )}

      {/* Fainted Dizzy Particles */}
      {status === 'fainted' && (
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 select-none pointer-events-none z-35 flex flex-col items-center gap-1">
          <span className="text-4xl animate-spin duration-1000" style={{ animationDuration: '4s' }}>💫</span>
          <span className="text-lg bg-white/90 border border-black px-1.5 py-0.5 rounded-md font-bold text-red-500 shadow">晕倒啦!</span>
        </div>
      )}

      {/* Hungry sweat or bubble */}
      {status === 'hungry' && (
        <div className="absolute -top-4 -left-4 select-none pointer-events-none z-30 bg-white border-2 border-[#2d3436] rounded-full px-2 py-1 shadow-[2px_2px_0_#2d3436] text-[10px] animate-pulse flex items-center gap-1 font-bold text-orange-600">
          <span>🗯️</span>
          <span>肚子饿... 🍗?</span>
        </div>
      )}
    </div>
  );
}
