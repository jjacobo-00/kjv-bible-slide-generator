/**
 * HelpModal.jsx
 * A comprehensive, tabbed instruction guide for new users.
 * Uses a fixed height and tabbed navigation for a stable, informative UX.
 */
import { useState } from 'react';
import bibleStep from '../assets/onboarding/bible_step.png';
import lyricsStep from '../assets/onboarding/lyrics_step.png';
import styleStep from '../assets/onboarding/style_step.png';
import textStylesStep from '../assets/onboarding/text_styles_step.png';
import alignmentStep from '../assets/onboarding/alignment_step.png';
import reorderStep from '../assets/onboarding/reorder_step.png';
import exportStep from '../assets/onboarding/export_step.png';

const tabs = [
  {
    id: 'welcome',
    label: 'Welcome',
    title: 'Welcome! 👋',
    description: 'CBT KJV Bible & Lyrics Generator helps you create beautiful slides for church in seconds. Use the tabs below to learn how to use each feature!',
    image: null,
  },
  {
    id: 'basics',
    label: 'Bible & Lyrics',
    title: '1. Getting Content',
    description: 'Type a verse like "John 3:16" in Bible mode and click Fetch, or switch to Lyrics mode and paste your song text. We automatically split the text into beautiful slides for you.',
    image: bibleStep,
  },
  {
    id: 'reorder',
    label: 'Rearrange',
    title: '2. Organizing Slides',
    description: 'Click the "Edit" button to open the Organizer. You can drag slides to reorder them, move them Up/Down using the arrows, or delete them if needed.',
    image: reorderStep,
  },
  {
    id: 'background',
    label: 'Background',
    title: '3. Background Settings',
    description: 'Make your slides stand out! Choose a solid color or upload your own image. High-quality backgrounds help the congregation stay engaged.',
    image: styleStep,
  },
  {
    id: 'typography',
    label: 'Text Styles',
    title: '4. Fonts & Colors',
    description: 'Ensure your text is easy to read. Change the font family, adjust the size, and pick a color that contrasts well with your background.',
    image: textStylesStep,
  },
  {
    id: 'alignment',
    label: 'Alignment',
    title: '5. Text Layout',
    description: 'Control where your text appears on the slide. Quickly switch between Center, Top, Left, or Bottom alignments for the best visual balance.',
    image: alignmentStep,
  },
  {
    id: 'export',
    label: 'Export',
    title: '6. Download PPTX',
    description: 'When you are happy with the preview, click "Download PPTX". You will get a professional PowerPoint file ready for your church service!',
    image: exportStep,
  },
];

export default function HelpModal({ onClose }) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const tab = tabs[activeTabIdx];

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('kjv_hide_help_onboarding', 'true');
    } else {
      localStorage.setItem('kjv_hide_help_onboarding', 'false');
    }
    onClose();
  };

  const next = () => {
    if (activeTabIdx < tabs.length - 1) setActiveTabIdx(activeTabIdx + 1);
    else handleClose();
  };

  const prev = () => {
    if (activeTabIdx > 0) setActiveTabIdx(activeTabIdx - 1);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={handleClose}>
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">How to Use</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Quick Start & Features Guide</p>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-950/30 px-2 shrink-0">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTabIdx(i)}
              className={`px-4 py-3 text-[13px] font-bold whitespace-nowrap border-b-2 transition-all ${
                i === activeTabIdx 
                  ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5' 
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area - FIXED height to avoid button chasing */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="p-8 flex-1 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">{tab.title}</h3>
            
            {tab.image ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-700/50 mb-8 bg-slate-950 shadow-2xl flex-shrink-0">
                 <img src={tab.image} alt={tab.title} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-10 border border-indigo-500/20 flex-shrink-0">
                 <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>
            )}
            
            <p className="text-slate-300 text-lg leading-relaxed max-w-lg font-medium">
              {tab.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/80 flex items-center gap-4 border-t border-slate-800 shrink-0">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-600 rounded flex items-center justify-center peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all group-hover:border-slate-400">
                <svg className={`w-3 h-3 text-white transition-opacity ${dontShowAgain ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider">
              Don't show again
            </span>
          </label>

          <div className="flex-1" />

          <div className="flex gap-3">
             {activeTabIdx > 0 && (
               <button onClick={prev} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700">
                 Back
               </button>
             )}
             <button 
               onClick={next} 
               className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 group min-w-[140px] justify-center"
             >
               <span>{activeTabIdx === tabs.length - 1 ? 'Start Creating' : 'Next Step'}</span>
               {activeTabIdx < tabs.length - 1 && (
                 <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
