/**
 * ExportStatus.jsx
 * Floating loading indicator for PowerPoint generation/download.
 */
import React from 'react';

export default function ExportStatus({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wide">Preparing Presentation</span>
          <span className="text-xs text-slate-400 font-medium">Brewing your slides...</span>
        </div>
        <div className="ml-4 pl-4 border-l border-white/10 h-8 flex items-center">
           <div className="flex gap-1">
             <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
           </div>
        </div>
      </div>
    </div>
  );
}
