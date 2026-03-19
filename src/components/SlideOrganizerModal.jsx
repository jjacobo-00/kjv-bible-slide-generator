import { useState } from 'react';

export default function SlideOrganizerModal({ slides, onClose, onSave, settings }) {
  const [tempSlides, setTempSlides] = useState([...slides]);

  const moveSlide = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= tempSlides.length) return;
    const newSlides = [...tempSlides];
    const [moved] = newSlides.splice(idx, 1);
    newSlides.splice(newIdx, 0, moved);
    setTempSlides(newSlides);
  };

  const moveToEnd = (idx, toStart = false) => {
    const newSlides = [...tempSlides];
    const [moved] = newSlides.splice(idx, 1);
    if (toStart) newSlides.unshift(moved);
    else newSlides.push(moved);
    setTempSlides(newSlides);
  };

  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (idx) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (targetIdx) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newSlides = [...tempSlides];
    const [moved] = newSlides.splice(draggedIdx, 1);
    newSlides.splice(targetIdx, 0, moved);
    
    setTempSlides(newSlides);
    setDraggedIdx(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#1a1c2a] border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <div>
                <h3 className="text-white font-bold text-xl tracking-tight">Slide Organizer</h3>
                <p className="text-slate-400 text-xs mt-0.5">Drag to rearrange or use the quick controls below.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/40 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-black/20 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {tempSlides.map((s, idx) => {
                    const parts = s.verseState.verseRef?.split(' ') || [];
                    const book = parts.slice(0, -1).join(' ');
                    const chapVer = parts.slice(-1)[0];
                    
                    const thumbBg = settings.bgImageUrl 
                      ? { backgroundImage: `url(${settings.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { backgroundColor: settings.bgColor };

                    return (
                      <div 
                        key={s.id} 
                        draggable="true"
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`group relative aspect-video rounded-2xl border shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col items-center justify-center ${
                          draggedIdx === idx 
                            ? 'opacity-40 border-dashed border-indigo-400 scale-95' 
                            : 'border-slate-700 hover:border-indigo-500/50 hover:scale-105 hover:shadow-indigo-500/10'
                        }`}
                      >
                          {/* Mini Background Layer */}
                          <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60" style={thumbBg} />
                          <div className="absolute inset-0 bg-slate-900/60" />

                          {/* Content Overlay */}
                          <div className="relative z-10 flex flex-col items-center p-4">
                              <span className="text-2xl font-black text-white/50 tracking-tighter mb-1">
                                  {idx + 1}
                              </span>
                              
                              {s.verseState.verseRef && (
                                <div className="flex flex-col items-center leading-tight">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                     {book}
                                   </span>
                                   <span className="text-sm font-black text-white mt-0.5 font-mono">
                                     {chapVer}
                                   </span>
                                </div>
                              )}
                          </div>
  
                          {/* Drag Indicator Overlay (Visible on hover) */}
                          <div className={`absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none ${draggedIdx !== null ? 'hidden' : ''}`}>
                               <div className="bg-slate-900/90 px-4 py-2 rounded-full border border-indigo-500/50 flex items-center gap-2 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m-3-0.5a3 3 0 006 0V6a1.5 1.5 0 113 0V12m-3-0.5a3 3 0 006 0V6a1.5 1.5 0 113 0V12" />
                                  </svg>
                                  <span className="text-xs font-black text-white uppercase tracking-widest">Move Slide</span>
                               </div>
                          </div>
                      </div>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                Total Slides: {tempSlides.length}
            </p>
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={() => onSave(tempSlides)}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-xl shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 hover:-translate-y-0.5"
                >
                    Apply New Order
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
