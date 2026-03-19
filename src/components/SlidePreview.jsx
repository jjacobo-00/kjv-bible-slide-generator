/**
 * SlidePreview.jsx
 * Live visual preview card that mirrors exactly how the PPTX slide will look.
 * Maintains a 16:9 (widescreen) aspect ratio and updates in real-time.
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { ptToCssPreviewPx } from '../utils/fontScaler.js';
import { getLyricsFontSize } from '../utils/lyricsParser.js';


/**
 * @param {Object} props
 * @param {Object}   props.settings   - Slide appearance settings
 * @param {string}   props.appMode    - 'bible' | 'lyrics'
 * @param {Array}    props.slides     - Array of bible slides
 * @param {string|number} props.activeSlideId - ID of the focused slide
 * @param {Function} props.onSetActiveSlide - Callback to jump to a slide
 * @param {Object}   props.fontScale  - { fontSize, overflow, sizeLabel }
 * @param {string[]} props.lyricsSlides - Array of lyric lines
 * @param {Function} props.onSettingsChange - Callback to update global settings
 */
export default function SlidePreview({ 
  settings, 
  appMode, 
  slides = [], 
  activeSlideId, 
  onSetActiveSlide, 
  fontScale, 
  lyricsSlides = [], 
  onSettingsChange 
}) {
  const containerRef = useRef(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const isScrollingRef = useRef(false);
  const slideRefs = useRef({});

  // Compute CSS pixel font sizes from pt values
  const mainFontPx = useMemo(() => {
    const ptSize = settings.baseFontSize || fontScale?.fontSize || 42;
    return ptToCssPreviewPx(ptSize, 800);
  }, [settings.baseFontSize, fontScale]);

  const refFontPx = useMemo(() => {
    return Math.max(11, mainFontPx * 0.65);
  }, [mainFontPx]);

  // Determine the background CSS
  const backgroundStyle = useMemo(() => {
    if (settings.bgImageUrl && settings.bgImageUrl.trim()) {
      return {
        backgroundImage: `url(${settings.bgImageUrl.trim()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: settings.bgColor,
      };
    }
    return { backgroundColor: settings.bgColor };
  }, [settings.bgColor, settings.bgImageUrl]);

  // Components for the individual slide core logic
  const SlideCard = ({ text, refText, isLyric = false }) => {
    const lyricFontSizePt = isLyric ? (settings.baseFontSize || getLyricsFontSize(text)) : (settings.baseFontSize || fontScale?.fontSize || 42);
    const lyricFontSizePx = ptToCssPreviewPx(lyricFontSizePt, 800);
    const layout = settings.layout || 'center';
    
    const layoutClasses = {
      center: 'items-center justify-center text-center',
      left:   'items-start justify-center text-left pl-[10%] pr-[15%]'
    }[layout] || 'items-center justify-center text-center';

    return (
      <div
        className="group relative shadow-2xl shadow-black/80 rounded-sm overflow-hidden ring-1 ring-white/10 w-full transition-transform duration-500 hover:scale-[1.01] shrink-0"
        style={{ aspectRatio: '16 / 9', maxWidth: '1000px' }}
      >
        <div className="absolute inset-0 transition-colors duration-300" style={backgroundStyle} />
        {settings.bgImageUrl?.trim() && <div className="absolute inset-0 bg-black/40" />}
        <div className={`absolute inset-0 flex flex-col p-[8%] ${layoutClasses}`}>
          <div className="w-[85%] mx-auto">
            <p
              className="transition-all duration-300 font-bold whitespace-pre-wrap tracking-tight"
              style={{
                fontFamily: isLyric ? "'Montserrat', 'Inter', sans-serif" : settings.fontFamily,
                fontSize: `${isLyric ? lyricFontSizePx : mainFontPx}px`,
                color: settings.fontColor,
                lineHeight: 1.4,
                textShadow: '0 4px 12px rgba(0,0,0,0.7)',
              }}
            >
              {text}
            </p>
            {refText && (
              <p
                className="mt-8 transition-all duration-300"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${refFontPx}px`,
                  color: settings.fontColor,
                  fontStyle: 'italic',
                  opacity: 0.8,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                — {refText}
              </p>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 right-6 text-white/15 text-[10px] font-mono select-none pointer-events-none tracking-widest">
          {isLyric ? 'SONG' : 'KJV'}
        </div>
        
        {/* Layout Position Toggles */}
        <div className="absolute top-4 right-4 flex gap-1.5 overflow-hidden rounded-lg bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1">
          {[
            { id: 'center', title: 'Centered', path: <path d="M4 8h16M4 12h16M4 16h16" /> },
            { id: 'left', title: 'Left Aligned', path: <path d="M4 5v14M9 8l-4 4 4 4M5 12h13" /> }
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={(e) => { e.stopPropagation(); onSettingsChange('layout', opt.id); }}
              className={`p-1.5 rounded-md transition-all ${settings.layout === opt.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
              title={opt.title}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {opt.path}
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Sync scroll position with activeSlideId from parent
  useEffect(() => {
    if (appMode === 'bible' && activeSlideId && slideRefs.current[activeSlideId] && !isScrollingRef.current) {
      slideRefs.current[activeSlideId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSlideId, appMode]);

  // Track the current visible slide
  const handleScroll = (e) => {
    if (!containerRef.current) return;
    isScrollingRef.current = true;
    
    const scrollPos = e.target.scrollTop;
    const containerHeight = e.target.clientHeight;
    const totalSlides = appMode === 'bible' 
      ? slides.filter(s => s.verseState.verseText).length 
      : lyricsSlides.length;
    
    if (totalSlides <= 1) {
      isScrollingRef.current = false;
      return;
    }

    const scrollHeight = e.target.scrollHeight;
    const index = Math.min(
      totalSlides - 1,
      Math.max(0, Math.round((scrollPos / (scrollHeight - containerHeight)) * (totalSlides - 1)))
    );

    setCurrentSlideIndex(index);
    
    if (appMode === 'bible') {
      const bibleSlidesContent = slides.filter(s => s.verseState.verseText);
      const scrolledSlide = bibleSlidesContent[index];
      if (scrolledSlide && scrolledSlide.id !== activeSlideId) {
        onSetActiveSlide(scrolledSlide.id);
      }
    }

    if (scrollPos > 50) setShowScrollHint(false);

    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  useEffect(() => {
    const totalSlides = appMode === 'bible' 
      ? slides.filter(s => s.verseState.verseText).length 
      : lyricsSlides.length;
    setShowScrollHint(totalSlides > 1);
  }, [appMode, slides, lyricsSlides.length]);

  const bibleSlidesContent = useMemo(() => slides.filter(s => s.verseState.verseText), [slides]);
  const hasBibleContent = bibleSlidesContent.length > 0;
  const hasLyrics = lyricsSlides.length > 0;

  return (
    <div className="relative flex-1 flex flex-col items-center bg-[#0a0c14] overflow-hidden">
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="w-full flex-1 flex flex-col items-center py-[25vh] px-8 overflow-y-auto no-scrollbar snap-y snap-mandatory"
      >
        <div className="flex items-center gap-2 mb-6 self-start">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
            {appMode === 'bible' ? 'Bible Verse Preview' : 'Song Lyrics Preview'}
          </span>
        </div>

        <div className="w-full flex flex-col items-center gap-[20vh]">
          {appMode === 'bible' ? (
            hasBibleContent ? (
              bibleSlidesContent.map((s) => (
                <div key={s.id} ref={el => slideRefs.current[s.id] = el} className="w-full flex justify-center snap-center">
                  <SlideCard text={s.verseState.verseText} refText={s.verseState.verseRef} />
                </div>
              ))
            ) : (
              <div className="aspect-video w-full max-w-[1000px] border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center gap-4 opacity-40">
                 <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                 </svg>
                 <p className="text-sm font-medium text-slate-500">Search for a verse to generate slides</p>
              </div>
            )
          ) : (
            hasLyrics ? (
              lyricsSlides.map((line, idx) => (
                <div key={`${idx}-${line}`} className="w-full flex justify-center snap-center">
                  <SlideCard text={line} isLyric={true} />
                </div>
              ))
            ) : (
              <div className="aspect-video w-full max-w-[1000px] border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center gap-4 opacity-40">
                 <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                 </svg>
                 <p className="text-sm font-medium text-slate-500">Paste lyrics in the sidebar to generate slides</p>
              </div>
            )
          )}
        </div>

        {/* Floating Page Indicator */}
        {((appMode === 'lyrics' && lyricsSlides.length > 1) || (appMode === 'bible' && hasBibleContent && bibleSlidesContent.length > 1)) && (
          <div className="fixed bottom-24 right-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <span className="text-[10px] font-bold text-indigo-400">SLIDE</span>
             <span className="text-[14px] font-black text-white">
               {currentSlideIndex + 1}
               <span className="text-slate-500 font-medium px-1">/</span>
               {appMode === 'lyrics' ? lyricsSlides.length : bibleSlidesContent.length}
             </span>
          </div>
        )}

        {/* Scroll Hint Arrow */}
        {showScrollHint && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-60">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scroll for more</span>
             <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
             </svg>
          </div>
        )}

        {/* Metadata Footer */}
        {appMode === 'bible' && hasBibleContent && (
          <div className="flex items-center gap-4 mt-12 py-2 px-4 bg-slate-900/50 rounded-full border border-slate-800/50 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-500"/> Bible Mode</span>
            <span className="w-px h-3 bg-slate-800"/>
            <span>{bibleSlidesContent.length} slides</span>
            <span className="w-px h-3 bg-slate-800"/>
            <span className="text-indigo-400 capitalize">{settings.layout}</span>
          </div>
        )}
      </div>
    </div>
  );
}
