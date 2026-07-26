import React, { useState } from 'react';
import { GachaItem } from '../types';
import { GACHA_ITEMS } from '../data';
import { Ticket, Sparkles, RefreshCw, Trophy } from 'lucide-react';

interface GachaSystemProps {
  tickets: number;
  unlockedOutfits: string[];
  unlockedDecorations: string[];
  onDrawSuccess: (item: GachaItem, refundTicket: boolean) => void;
}

export default function GachaSystem({
  tickets,
  unlockedOutfits,
  unlockedDecorations,
  onDrawSuccess,
}: GachaSystemProps) {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnItem, setDrawnItem] = useState<GachaItem | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [ballState, setBallState] = useState<'idle' | 'rattle' | 'opening' | 'revealed'>('idle');

  const rollRarity = (): 'common' | 'rare' | 'epic' => {
    const roll = Math.random() * 100;
    if (roll < 10) return 'epic';    // 10% chance
    if (roll < 40) return 'rare';    // 30% chance
    return 'common';                // 60% chance
  };

  const handleDraw = () => {
    if (tickets < 1 || isDrawing) return;

    setIsDrawing(true);
    setDrawnItem(null);
    setIsDuplicate(false);
    setBallState('rattle');

    // Simulate rattling sound and movement sequence
    setTimeout(() => {
      setBallState('opening');
    }, 1200);

    setTimeout(() => {
      // Choose item
      const targetRarity = rollRarity();
      let pool = GACHA_ITEMS.filter((item) => item.rarity === targetRarity);
      if (pool.length === 0) pool = GACHA_ITEMS; // Fallback

      const selectedItem = pool[Math.floor(Math.random() * pool.length)];

      // Check if duplicate
      const alreadyUnlocked =
        selectedItem.type === 'outfit'
          ? unlockedOutfits.includes(selectedItem.id)
          : unlockedDecorations.includes(selectedItem.id);

      setDrawnItem(selectedItem);
      setIsDuplicate(alreadyUnlocked);
      setBallState('revealed');
      setIsDrawing(false);

      // Trigger callback to update state
      onDrawSuccess(selectedItem, alreadyUnlocked);
    }, 2000);
  };

  const getRarityLabel = (rarity: 'common' | 'rare' | 'epic') => {
    switch (rarity) {
      case 'epic':
        return { text: '⭐ 传说 Epic', style: 'text-purple-600 bg-purple-100 border-purple-400' };
      case 'rare':
        return { text: '⭐ 稀有 Rare', style: 'text-amber-600 bg-amber-100 border-amber-400' };
      case 'common':
      default:
        return { text: '普通 Common', style: 'text-slate-600 bg-slate-100 border-slate-300' };
    }
  };

  return (
    <div className="flex flex-col gap-5 items-center justify-center p-2 text-[#2d3436]">
      {/* Ticket Balance Widget */}
      <div className="flex items-center gap-3 bg-[#f8f1ff] px-4 py-2.5 rounded-xl border-3 border-[#2d3436] shadow-[3px_3px_0_#2d3436]">
        <div className="flex items-center gap-1.5 text-[#ff7eb6]">
          <Ticket className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-wider">CHANCES LEFT:</span>
        </div>
        <span className="text-lg font-bold font-mono text-[#2d3436]">
          {tickets} 张券
        </span>
      </div>

      {/* Gacha Machine Graphics */}
      <div className="relative w-full max-w-[280px] aspect-[4/5] bg-white rounded-2xl border-4 border-[#2d3436] shadow-[6px_6px_0_#2d3436] flex flex-col items-center justify-between p-4 overflow-hidden">
        {/* Glow behind Capsule container */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4/5 h-2/5 bg-[#ff7eb6]/10 rounded-full blur-xl pointer-events-none" />

        {/* Capsule container (Top half) */}
        <div className="w-full h-3/5 bg-slate-50/50 rounded-xl border-2 border-[#2d3436] flex items-center justify-center relative p-3">
          {ballState === 'idle' && (
            <div className="flex flex-wrap gap-2.5 items-center justify-center">
              {/* Colorful sleeping capsules */}
              <div className="w-8 h-8 rounded-full bg-[#ff7eb6] border-2 border-black shadow-[2px_2px_0_black] animate-bounce-slow" />
              <div className="w-8 h-8 rounded-full bg-[#70d6ff] border-2 border-black shadow-[2px_2px_0_black] animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-black shadow-[2px_2px_0_black] animate-bounce-slow" style={{ animationDelay: '0.4s' }} />
              <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-black shadow-[2px_2px_0_black] animate-bounce" style={{ animationDelay: '0.1s' }} />
            </div>
          )}

          {ballState === 'rattle' && (
            <div className="flex gap-2 items-center justify-center animate-shake infinite duration-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff7eb6] to-amber-300 border-2 border-black shadow-[3px_3px_0_black] animate-ping" />
              <div className="w-8 h-8 rounded-full bg-[#70d6ff] border-2 border-black shadow-[3px_3px_0_black] animate-bounce" />
            </div>
          )}

          {ballState === 'opening' && (
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-8 h-8 text-[#ff7eb6] animate-spin" />
              <span className="text-[10px] text-[#2d3436] font-bold font-mono tracking-widest animate-pulse">
                CRACKING OPEN...
              </span>
            </div>
          )}

          {ballState === 'revealed' && drawnItem && (
            <div className="flex flex-col items-center justify-center text-center animate-scale-up">
              {/* Prize card with custom border glow based on rarity */}
              <div className={`p-4 rounded-xl border-3 bg-white shadow-[4px_4px_0_#2d3436] relative ${
                drawnItem.rarity === 'epic'
                  ? 'border-purple-500'
                  : drawnItem.rarity === 'rare'
                  ? 'border-amber-500'
                  : 'border-[#2d3436]'
              }`}>
                {/* Rarity label */}
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border-2 mb-2 inline-block ${getRarityLabel(drawnItem.rarity).style}`}>
                  {getRarityLabel(drawnItem.rarity).text}
                </span>

                {/* Big Icon */}
                <div className="text-5xl my-1 select-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">
                  {drawnItem.icon}
                </div>

                {/* Name */}
                <h5 className="text-xs font-bold text-[#2d3436] my-1 font-display">
                  {drawnItem.name}
                </h5>

                {/* Description */}
                <p className="text-[9px] text-slate-500 max-w-[160px] leading-relaxed">
                  {drawnItem.description}
                </p>

                {/* Duplicate Notification banner */}
                {isDuplicate && (
                  <div className="absolute -top-3 -right-3 bg-rose-500 border-2 border-black px-2 py-0.5 rounded text-[8px] font-bold text-white shadow-md animate-bounce">
                    已拥有！退回 1 券
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Dial / Dispenser (Bottom half) */}
        <div className="w-full flex flex-col items-center gap-3">
          {/* Outlet Dispenser Hole */}
          <div className="w-14 h-8 bg-slate-100 border-2 border-[#2d3436] rounded-md shadow-inner flex items-center justify-center">
            {ballState === 'opening' && (
              <div className="w-5 h-5 rounded-full bg-purple-500 border border-black animate-pulse" />
            )}
          </div>

          {/* Draw Button / Turn Dial */}
          <button
            onClick={handleDraw}
            disabled={tickets < 1 || isDrawing}
            className={`w-full py-2.5 px-4 rounded-xl font-bold font-display text-xs uppercase tracking-wider border-3 border-black flex items-center justify-center gap-2 transition-all ${
              tickets >= 1 && !isDrawing
                ? 'bg-[#ff7eb6] text-white shadow-[3px_3px_0_black] hover:scale-[1.02] active:translate-y-[2px] active:shadow-[1px_1px_0_black]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-dashed'
            }`}
          >
            {isDrawing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                正在扭蛋中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                花费 1 抽奖券！
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rarity Rates / Help list */}
      <div className="w-full max-w-[280px] bg-white p-3.5 rounded-xl border-3 border-[#2d3436] shadow-[3px_3px_0_#2d3436] flex flex-col gap-1.5 text-[10px] text-slate-600 leading-normal">
        <div className="flex justify-between items-center border-b-2 border-dashed border-slate-300 pb-1.5 mb-1 text-[#2d3436] font-bold">
          <span>💫 扭蛋出货率:</span>
          <span className="font-mono text-[9px] uppercase">PROBABILITY</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-600 font-bold">🔮 传说 (Epic) 皇冠/翅膀</span>
          <span className="font-mono font-bold">10%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600 font-bold font-mono">💎 稀有 (Rare) 侦探/猫耳</span>
          <span className="font-mono font-bold">30%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 font-bold">📦 普通 (Common) 墨镜/零食车</span>
          <span className="font-mono font-bold">60%</span>
        </div>
        <div className="mt-1 text-[9px] text-[#2d3436] bg-[#f8f1ff] px-2 py-1.5 rounded-lg border-2 border-[#2d3436] leading-relaxed text-center">
          💡 重复物品会自动退回抽奖券，无痛收集！
        </div>
      </div>
    </div>
  );
}
