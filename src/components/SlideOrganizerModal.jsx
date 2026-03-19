import { useState } from 'react';

export default function SlideOrganizerModal({ slides, onClose, onSave }) {
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
        <div className="flex-1 overflow-y-auto p-8 bg-black/20 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {tempSlides.map((s, idx) => (
                    <div 
                      key={s.id} 
                      draggable="true"
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`group relative bg-[#24273a] border rounded-xl overflow-hidden shadow-xl transition-all hover:shadow-indigo-500/20 cursor-grab active:cursor-grabbing ${
                        draggedIdx === idx 
                          ? 'opacity-40 border-dashed border-indigo-400 scale-95' 
                          : 'border-slate-700 hover:border-indigo-500/50 hover:scale-[1.02]'
                      }`}
                    >
                        {/* Slide Miniature Preview */}
                        <div className="aspect-video bg-slate-900 flex items-center justify-center p-5 text-center overflow-hidden">
                            <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-4 font-medium italic opacity-80 pointer-events-none">
                                {s.verseState.verseText || 'Empty Slide Content'}
                            </p>
                        </div>
                        
                        {/* Slide Number Badge */}
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xl border border-indigo-400/30">
                            {idx + 1}
                        </div>

                        {/* Drag Handle Icon (Static) */}
                        <div className="absolute top-3 right-3 text-slate-500/40 group-hover:text-slate-200 transition-colors pointer-events-none">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                             </svg>
                        </div>

                        {/* Quick Controls Overlay (Hidden when dragging) */}
                        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 scale-95 group-hover:scale-100 ${draggedIdx !== null ? 'hidden' : ''}`}>
                             <button onClick={(e) => { e.stopPropagation(); moveToEnd(idx, true); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all active:scale-90" title="Move to Start">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all active:scale-90" title="Move Left">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all active:scale-90" title="Move Right">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); moveToEnd(idx, false); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all active:scale-90" title="Move to End">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                             </button>
                        </div>
                        
                        {/* Ref Label */}
                        <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-700/50 flex items-center justify-between pointer-events-none">
                            <p className="text-[10px] text-slate-400 font-bold truncate max-w-[85%]">{s.verseState.verseRef || 'No Reference'}</p>
                        </div>
                    </div>
                ))}
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
