import React from 'react';

interface MacWindowProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export default function MacWindow({
  id,
  title,
  subtitle,
  children,
  headerActions,
  className = '',
}: MacWindowProps) {
  return (
    <div
      id={id}
      className={`mac-window-shadow flex flex-col rounded-xl overflow-hidden bg-white border-4 border-[#2d3436] ${className}`}
    >
      {/* macOS Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8f1ff] border-b-4 border-[#2d3436] select-none">
        {/* Red, Yellow, Green traffic lights with retro borders */}
        <div className="flex items-center space-x-2 w-24">
          <div className="w-4.5 h-4.5 rounded-full bg-rose-500 border-2 border-[#2d3436] hover:bg-rose-600 transition-colors cursor-pointer relative group flex items-center justify-center">
            <span className="text-[8px] text-rose-950 font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute">×</span>
          </div>
          <div className="w-4.5 h-4.5 rounded-full bg-amber-400 border-2 border-[#2d3436] hover:bg-amber-500 transition-colors cursor-pointer relative group flex items-center justify-center">
            <span className="text-[8px] text-amber-950 font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute">−</span>
          </div>
          <div className="w-4.5 h-4.5 rounded-full bg-emerald-400 border-2 border-[#2d3436] hover:bg-emerald-500 transition-colors cursor-pointer relative group flex items-center justify-center">
            <span className="text-[8px] text-emerald-950 font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute">+</span>
          </div>
        </div>

        {/* Window Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-display font-bold text-sm text-[#2d3436] tracking-wide flex items-center gap-1.5 uppercase">
            {title}
          </span>
          {subtitle && (
            <span className="font-mono text-[9px] text-slate-500 font-bold">
              {subtitle}
            </span>
          )}
        </div>

        {/* Extra actions at right of header */}
        <div className="flex items-center justify-end w-24">
          {headerActions || (
            <div className="flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#2d3436]"></span>
              <span className="w-2 h-2 rounded-full bg-[#2d3436]"></span>
              <span className="w-2 h-2 rounded-full bg-[#2d3436]"></span>
            </div>
          )}
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 flex flex-col p-4 bg-white text-[#2d3436]">
        {children}
      </div>
    </div>
  );
}
