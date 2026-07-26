import React, { useState, useRef, useEffect } from 'react';
import { PlacedDecoration, BeadPet, GachaItem } from '../types';
import { GACHA_ITEMS } from '../data';
import BeadPetRenderer from './BeadPetRenderer';
import { Move, Trash2, HelpCircle } from 'lucide-react';

interface PetRoomProps {
  pet: BeadPet | null;
  placedDecorations: PlacedDecoration[];
  unlockedDecorations: string[];
  animationState: 'idle' | 'float' | 'bounce' | 'wave';
  onUpdateDecorations: (newDecorations: PlacedDecoration[]) => void;
  onUpdatePet?: (updatedPet: BeadPet) => void;
}

export default function PetRoom({
  pet,
  placedDecorations,
  unlockedDecorations,
  animationState,
  onUpdateDecorations,
  onUpdatePet,
}: PetRoomProps) {
  const [activeWallpaper, setActiveWallpaper] = useState<'cozy' | 'starry' | 'pink' | 'cyber'>('cozy');
  const [selectedDecorId, setSelectedDecorId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const roomRef = useRef<HTMLDivElement>(null);

  // Wander movement state
  const [petX, setPetX] = useState<number>(50); // percentage from left
  const [petY, setPetY] = useState<number>(65); // percentage from top
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [isWandering, setIsWandering] = useState<boolean>(true);

  // Feeding/Playing overlay particle effect states
  const [feedEffect, setFeedEffect] = useState<boolean>(false);
  const [playEffect, setPlayEffect] = useState<boolean>(false);

  // Dragging state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Filter out which items are actually unlocked decorations
  const decorationPool = GACHA_ITEMS.filter(
    (item) => item.type === 'decoration' && unlockedDecorations.includes(item.id)
  );

  // Calculate Pet status & schedule
  const petHunger = pet?.hunger !== undefined ? pet.hunger : 100;
  const isFainted = petHunger <= 0;
  const isHungry = petHunger > 0 && petHunger <= 30;

  // Waking up late, afternoon nap, staying up late schedule logic
  const getPetSchedule = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMin = hour * 60 + minute;

    // Sleeping (Waking up late): 2:00 AM (120) to 10:00 AM (600)
    if (totalMin >= 120 && totalMin < 600) {
      return { state: 'sleeping' as const, label: '呼呼大睡中 (晚起至10:00)', emoji: '💤', description: '昨晚熬夜太晚了，现在正舒舒服服地赖床中...' };
    }
    // Sleeping (Noon nap): 12:30 PM (750) to 2:00 PM (840)
    if (totalMin >= 750 && totalMin < 840) {
      return { state: 'sleeping' as const, label: '惬意午休中 (12:30 - 14:00)', emoji: '😴', description: '午睡时间到！眯一会儿能大大恢复精力哦。' };
    }
    // Staying up late: 10:00 PM (1320) to 2:00 AM (120 next day)
    if (totalMin >= 1320 || totalMin < 120) {
      return { state: 'late_night' as const, label: '夜猫子熬夜中 (22:00 - 02:00)', emoji: '⚡', description: '元气满满的夜行时间！正和你一起在桌面上摸鱼。' };
    }
    return { state: 'awake' as const, label: '日常活力营业中', emoji: '☀️', description: '工作学习的好伙伴，随时等你呼唤互动！' };
  };

  const schedule = getPetSchedule();
  
  // Overall display status
  let displayStatus: 'normal' | 'sleeping' | 'hungry' | 'fainted' = 'normal';
  if (isFainted) {
    displayStatus = 'fainted';
  } else if (schedule.state === 'sleeping') {
    displayStatus = 'sleeping';
  } else if (isHungry) {
    displayStatus = 'hungry';
  }

  // Active wander effect depending on schedule and health status
  useEffect(() => {
    if (!isWandering || !pet || displayStatus === 'sleeping' || displayStatus === 'fainted') {
      if (displayStatus === 'fainted') {
        // Fall down safely on the floor
        setPetX(50);
        setPetY(75);
      }
      return;
    }

    const wander = () => {
      const targetX = 12 + Math.random() * 73;
      const targetY = 45 + Math.random() * 30;

      setPetX((prevX) => {
        if (targetX < prevX) {
          setFacingLeft(true);
        } else if (targetX > prevX) {
          setFacingLeft(false);
        }
        return targetX;
      });
      setPetY(targetY);
    };

    wander();

    const interval = setInterval(wander, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isWandering, pet, displayStatus]);

  // Care interaction handlers
  const handleFeed = () => {
    if (!pet || !onUpdatePet) return;
    setFeedEffect(true);
    setTimeout(() => setFeedEffect(false), 2000);

    onUpdatePet({
      ...pet,
      hunger: Math.min(100, petHunger + 25),
      lastInteracted: Date.now()
    });
  };

  const handlePlay = () => {
    if (!pet || !onUpdatePet || isFainted) return;
    setPlayEffect(true);
    setTimeout(() => setPlayEffect(false), 2000);

    onUpdatePet({
      ...pet,
      hunger: Math.min(100, petHunger + 15),
      lastInteracted: Date.now()
    });
  };

  // Add decoration to the room
  const handleAddDecoration = (decorId: string) => {
    // Check if we already have it in the room (or allow multiple if unlocked)
    const newPlaced: PlacedDecoration = {
      id: `${decorId}_${Date.now()}`,
      decorationId: decorId,
      x: 30 + Math.random() * 40, // Random placement near center
      y: 50 + Math.random() * 25,
    };
    onUpdateDecorations([...placedDecorations, newPlaced]);
    setIsEditMode(true);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Offset from the cursor to top-left of the item
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingIndex(index);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingIndex === null || !roomRef.current) return;

    const roomRect = roomRef.current.getBoundingClientRect();
    let x = ((e.clientX - roomRect.left - dragOffset.x) / roomRect.width) * 100;
    let y = ((e.clientY - roomRect.top - dragOffset.y) / roomRect.height) * 100;

    // Boundaries clamping (0% to 90%)
    x = Math.max(0, Math.min(x, 90));
    y = Math.max(0, Math.min(y, 88));

    const updated = [...placedDecorations];
    updated[draggingIndex] = {
      ...updated[draggingIndex],
      x,
      y,
    };
    onUpdateDecorations(updated);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  // Support touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!isEditMode) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setDraggingIndex(index);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (draggingIndex === null || !roomRef.current) return;
    const touch = e.touches[0];
    const roomRect = roomRef.current.getBoundingClientRect();
    let x = ((touch.clientX - roomRect.left - dragOffset.x) / roomRect.width) * 100;
    let y = ((touch.clientY - roomRect.top - dragOffset.y) / roomRect.height) * 100;

    x = Math.max(0, Math.min(x, 90));
    y = Math.max(0, Math.min(y, 88));

    const updated = [...placedDecorations];
    updated[draggingIndex] = {
      ...updated[draggingIndex],
      x,
      y,
    };
    onUpdateDecorations(updated);
  };

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingIndex, dragOffset]);

  const handleRemoveDecoration = (index: number) => {
    const updated = [...placedDecorations];
    updated.splice(index, 1);
    onUpdateDecorations(updated);
  };

  // Wallpapers theme configurations
  const WALLPAPER_STYLING = {
    cozy: 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/20',
    starry: 'bg-gradient-to-b from-indigo-950/50 via-slate-950 to-purple-950/40 border-purple-500/20',
    pink: 'bg-gradient-to-b from-pink-950/30 via-slate-900 to-rose-950/30 border-pink-500/20',
    cyber: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-cyan-500/20',
  };

  return (
    <div className="flex flex-col gap-5 h-full text-[#2d3436]">
      {/* Top toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border-4 border-[#2d3436] shadow-[4px_4px_0_#2d3436]">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2d3436] uppercase tracking-wide">🎨 壁纸 Theme:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['cozy', 'starry', 'pink', 'cyber'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setActiveWallpaper(w)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border-2 border-[#2d3436] uppercase transition-all ${
                    activeWallpaper === w
                      ? 'bg-[#ff7eb6] text-white shadow-[2px_2px_0_#2d3436] translate-y-[-1px]'
                      : 'bg-white text-[#2d3436] hover:bg-slate-50'
                  }`}
                >
                  {w === 'cozy' ? '原木' : w === 'starry' ? '星空' : w === 'pink' ? '粉甜' : '极光'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive options split */}
          <div className="flex flex-wrap gap-1.5 md:border-l-2 md:border-slate-300 md:pl-3.5">
            {pet && pet.originalImage && (
              <button
                onClick={() => {
                  if (onUpdatePet) {
                    onUpdatePet({
                      ...pet,
                      useOriginalImage: !pet.useOriginalImage,
                    });
                  }
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border-2 border-[#2d3436] uppercase transition-all ${
                  pet.useOriginalImage
                    ? 'bg-[#70d6ff] text-[#2d3436] shadow-[2px_2px_0_#2d3436] translate-y-[-1px]'
                    : 'bg-white text-[#2d3436] hover:bg-slate-50'
                }`}
                title="切换立绘原图或像素拼豆效果"
              >
                {pet.useOriginalImage ? '🖼️ 原图立绘' : '👾 拼豆风格'}
              </button>
            )}

            {pet && (
              <button
                onClick={() => setIsWandering(!isWandering)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border-2 border-[#2d3436] uppercase transition-all ${
                  isWandering
                    ? 'bg-[#55efc4] text-[#2d3436] shadow-[2px_2px_0_#2d3436] translate-y-[-1px]'
                    : 'bg-white text-[#2d3436] hover:bg-slate-50'
                }`}
                title="开启后桌宠会自己走来走去"
              >
                {isWandering ? '🐾 自由漫步中' : '📍 站立静止'}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg border-2 border-[#2d3436] transition-all shadow-[3px_3px_0_#2d3436] active:translate-y-[2px] active:shadow-[1px_1px_0_#2d3436] ${
            isEditMode
              ? 'bg-[#55efc4] text-[#2d3436]'
              : 'bg-[#70d6ff] text-[#2d3436]'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          {isEditMode ? '完成摆放' : '开始布置小家'}
        </button>
      </div>

      {/* Bento Interactive Status & Actions Panel */}
      {pet && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8fafd] p-3.5 rounded-xl border-4 border-[#2d3436] shadow-[4px_4px_0_#2d3436]">
          {/* Hunger Bar column */}
          <div className="flex flex-col justify-between bg-white p-3 rounded-lg border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-500 flex items-center gap-1">
                🔋 饱腹感 Hunger
              </span>
              <span className={`text-[10px] font-black font-mono ${isFainted ? 'text-red-500 animate-pulse' : isHungry ? 'text-orange-500 font-extrabold' : 'text-emerald-500'}`}>
                {petHunger}% {isFainted ? '(晕倒啦!)' : isHungry ? '(肚子饿!)' : '(肚子饱饱)'}
              </span>
            </div>
            
            <div className="w-full h-4 bg-slate-100 border-2 border-[#2d3436] rounded-full overflow-hidden relative">
              <div
                style={{ width: `${petHunger}%` }}
                className={`h-full transition-all duration-500 ${
                  isFainted ? 'bg-red-500' :
                  isHungry ? 'bg-amber-400 animate-pulse' :
                  'bg-emerald-400'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-[#2d3436] tracking-wider uppercase pointer-events-none">
                {petHunger > 0 ? 'ENERGY LEVEL' : 'UNCONSCIOUS'}
              </div>
            </div>
          </div>

          {/* Schedule Status column */}
          <div className="flex flex-col justify-between bg-white p-3 rounded-lg border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                ⏰ 作息日程 Schedule
              </span>
              <span className="text-xs">{schedule.emoji}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-[#2d3436] truncate">
                {schedule.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                {isFainted ? '因过度饥饿导致体能耗尽昏厥！' : schedule.description}
              </span>
            </div>
          </div>

          {/* Interaction & Care Actions column */}
          <div className="flex flex-col justify-between bg-white p-3 rounded-lg border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]">
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-500 mb-1.5 flex items-center justify-between">
              <span>🩺 互动护理 Care</span>
              <span className="text-[8px] font-mono text-slate-400">
                上次互动: {pet.lastInteracted ? new Date(pet.lastInteracted).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}) : '从不'}
              </span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleFeed}
                className="py-1 px-2 text-[10px] font-black rounded border-2 border-[#2d3436] bg-[#ffeaa7] hover:bg-[#f1c40f] text-[#2d3436] active:translate-y-[1px] shadow-[2px_2px_0_#2d3436] active:shadow-[1px_1px_0_#2d3436] transition-all flex items-center justify-center gap-1 uppercase cursor-pointer"
                title="喂食小点心，饱腹值 +25"
              >
                <span>🍖</span> 投喂点心
              </button>
              <button
                onClick={handlePlay}
                disabled={isFainted}
                className={`py-1 px-2 text-[10px] font-black rounded border-2 border-[#2d3436] text-[#2d3436] transition-all flex items-center justify-center gap-1 uppercase ${
                  isFainted
                    ? 'bg-slate-100 text-slate-400 border-slate-300 shadow-none cursor-not-allowed'
                    : 'bg-[#a29bfe] hover:bg-[#6c5ce7] hover:text-white active:translate-y-[1px] shadow-[2px_2px_0_#2d3436] active:shadow-[1px_1px_0_#2d3436] cursor-pointer'
                }`}
                title={isFainted ? "晕倒了，无法互动！请先投喂点心" : "陪自推互动，饱腹值 +15"}
              >
                <span>🧸</span> 陪它玩耍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Room Canvas */}
      <div
        ref={roomRef}
        className={`relative flex-grow min-h-[340px] md:min-h-[420px] rounded-xl overflow-hidden border-4 border-[#2d3436] shadow-[6px_6px_0_#2d3436] bead-bg transition-all`}
      >
        {/* Helper guide */}
        {isEditMode && (
          <div className="absolute top-3 left-3 z-30 bg-white border-2 border-[#2d3436] px-3 py-1.5 rounded-lg text-[9px] text-[#2d3436] font-bold flex items-center gap-1.5 shadow-[3px_3px_0_#2d3436] animate-bounce">
            <HelpCircle className="w-4 h-4 text-[#ff7eb6] flex-shrink-0" />
            拖拽家具和装饰，点击红色垃圾桶移除
          </div>
        )}

        {/* Backdrop color filters depending on theme */}
        <div className={`absolute inset-0 opacity-15 pointer-events-none transition-all ${
          activeWallpaper === 'starry' ? 'bg-indigo-900' :
          activeWallpaper === 'pink' ? 'bg-pink-400' :
          activeWallpaper === 'cyber' ? 'bg-teal-500' : 'bg-transparent'
        }`} />

        {/* Extra beautiful bento styled sparkles & particles */}
        {activeWallpaper === 'starry' && (
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute top-10 left-12 w-2 h-2 bg-yellow-400 border border-black rounded-full animate-pulse" />
            <div className="absolute top-24 right-20 w-1.5 h-1.5 bg-white border border-black rounded-full animate-ping" />
            <div className="absolute top-40 left-1/3 w-2 h-2 bg-purple-400 border border-black rounded-full animate-pulse" />
          </div>
        )}

        {/* Placed Decorations layer */}
        {placedDecorations.map((placed, index) => {
          const item = GACHA_ITEMS.find((d) => d.id === placed.decorationId);
          if (!item) return null;

          return (
            <div
              key={placed.id}
              style={{
                left: `${placed.x}%`,
                top: `${placed.y}%`,
              }}
              className={`absolute group p-2 select-none transition-all ${
                isEditMode
                  ? 'cursor-grab border-2 border-dashed border-[#ff7eb6] bg-white/90 z-20 hover:border-solid hover:scale-110'
                  : 'z-10'
              }`}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
            >
              <div className="text-4xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)] select-none">
                {item.icon}
              </div>

              {/* Decorative tag / label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all pointer-events-none bg-white border border-[#2d3436] px-1.5 py-0.5 rounded text-[8px] text-[#2d3436] font-bold whitespace-nowrap z-30 shadow-[2px_2px_0_#2d3436]">
                {item.name}
              </div>

              {/* Trash button in edit mode */}
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDecoration(index);
                  }}
                  className="absolute -top-3 -right-3 p-1.5 bg-rose-500 hover:bg-rose-600 border-2 border-black text-white rounded-full shadow-md z-35 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Interactive Walking / Stationary Bead Pet */}
        {pet ? (
          <div
            style={{
              left: `${isWandering ? petX : 50}%`,
              top: `${isWandering ? petY : 65}%`,
              transition: isWandering && displayStatus !== 'sleeping' && displayStatus !== 'fainted' 
                ? 'left 4.5s cubic-bezier(0.25, 1, 0.5, 1), top 4.5s cubic-bezier(0.25, 1, 0.5, 1)' 
                : 'all 0.6s ease-in-out',
            }}
            className="absolute select-none z-15 flex flex-col items-center pointer-events-auto"
          >
            {/* Floating feed/play care effects directly nested so they never drift or overflow */}
            {(feedEffect || playEffect) && (
              <div className="absolute top-[-48px] left-1/2 -translate-x-1/2 pointer-events-none z-45 flex flex-col items-center select-none animate-bounce">
                {feedEffect && (
                  <div className="flex flex-col items-center">
                    <div className="text-xl flex gap-1 filter drop-shadow">🍖 ❤️ 🍿</div>
                    <div className="text-[8px] font-black bg-white border border-black px-1.5 py-0.5 rounded-full shadow-[1px_1px_0_#000] text-[#ff7eb6] mt-0.5 whitespace-nowrap">
                      饱腹 +25 🌟
                    </div>
                  </div>
                )}
                {playEffect && (
                  <div className="flex flex-col items-center">
                    <div className="text-xl flex gap-1 filter drop-shadow">✨ 🧸 🎉</div>
                    <div className="text-[8px] font-black bg-white border border-black px-1.5 py-0.5 rounded-full shadow-[1px_1px_0_#000] text-[#70d6ff] mt-0.5 whitespace-nowrap">
                      开心 +15 💖
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* The actual pet with horizontal flipping applied only to its renderer and custom walking bounce */}
            <div 
              style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
              className={`transition-transform duration-300 ${
                isWandering && displayStatus === 'normal' ? 'animate-bounce-slow' : ''
              }`}
            >
              <BeadPetRenderer 
                pet={pet} 
                animationState={isWandering && displayStatus === 'normal' ? 'bounce' : animationState} 
                size={120} 
                status={displayStatus} 
              />
            </div>
            
            {/* The tag name label - we reverse the flip so text remains readable! */}
            <div 
              className="mt-2 px-2.5 py-0.5 bg-white border border-[#2d3436] rounded-full flex items-center gap-1 shadow-[1.5px_1.5px_0_#2d3436] whitespace-nowrap"
            >
              <span className={`w-1.5 h-1.5 rounded-full border border-black animate-pulse ${isFainted ? 'bg-red-400' : isHungry ? 'bg-amber-400' : 'bg-[#55efc4]'}`}></span>
              <span className="text-[9px] font-black text-[#2d3436] uppercase tracking-wider">
                {pet.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-xs text-slate-500 bg-white/20">
            上传图片生成属于你的桌宠
          </div>
        )}

        {/* Cozy Wood Floor element at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-amber-900/10 border-t-4 border-[#2d3436]" />
      </div>

      {/* Gacha Items Pool / Decoration Cabinet */}
      <div className="bg-white p-4 rounded-xl border-4 border-[#2d3436] shadow-[4px_4px_0_#2d3436]">
        <h4 className="text-xs font-bold text-[#2d3436] uppercase mb-3 flex items-center gap-2">
          <span>📦 我的家具收纳柜 Cabinet</span>
          <span className="text-[10px] text-slate-500 font-normal">
            (已解锁 {decorationPool.length} 款)
          </span>
        </h4>

        {decorationPool.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
            <span className="text-[11px] text-slate-500 font-bold">空空如也，快去完成待办事项获得抽奖券吧！</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
            {decorationPool.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddDecoration(item.id)}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border-2 border-[#2d3436] rounded-xl shadow-[2px_2px_0_#2d3436] text-left hover:scale-[1.03] active:translate-y-[1px] active:shadow-[1px_1px_0_#2d3436] transition-all"
                title={item.description}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#2d3436] leading-tight">
                    {item.name}
                  </span>
                  <span className={`text-[8px] font-bold uppercase leading-none mt-0.5 ${
                    item.rarity === 'epic' ? 'text-purple-500' : item.rarity === 'rare' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
