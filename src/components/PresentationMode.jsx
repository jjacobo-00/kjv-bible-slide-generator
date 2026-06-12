import { useEffect, useState, useMemo, useRef } from 'react';
import { ptToCssPreviewPx } from '../utils/fontScaler.js';

export default function PresentationMode({ 
  settings, 
  appMode, 
  slides, 
  lyricsSlides, 
  onClose,
  initialSlideIndex = 0
}) {
  const [currentIdx, setCurrentIdx] = useState(initialSlideIndex);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const activeSlides = useMemo(() => {
    return appMode === 'bible' ? slides : lyricsSlides;
  }, [appMode, slides, lyricsSlides]);

  const totalSlides = activeSlides.length;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (containerRef.current && !document.fullscreenElement) {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error('Failed to enter full screen:', err);
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentIdx(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        setCurrentIdx(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setCurrentIdx(0);
      } else if (e.key === 'End') {
        setCurrentIdx(totalSlides - 1);
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

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

  const boxStyle = useMemo(() => {
    const screenW = dimensions.width;
    const screenH = dimensions.height;
    const targetRatio = 16 / 9;
    const screenRatio = screenW / screenH;

    let w, h;
    if (screenRatio > targetRatio) {
      h = screenH;
      w = h * targetRatio;
    } else {
      w = screenW;
      h = w / targetRatio;
    }
    return { width: `${w}px`, height: `${h}px` };
  }, [dimensions]);

  const currentSlide = activeSlides[currentIdx];
  if (!currentSlide) return null;

  const text = appMode === 'bible' ? currentSlide.verseState.verseText : currentSlide.text;
  const refText = appMode === 'bible' ? currentSlide.verseState.verseRef : currentSlide.refText;
  const isTitle = (appMode === 'bible' && currentSlide.type === 'title') || (appMode === 'lyrics' && currentSlide.type === 'title');

  // No auto-resize, just use the settings or fontScale directly
  const boxWidth = parseFloat(boxStyle.width);
  // Re-calculate ptSize like in SlidePreview.jsx
  const ptSize = settings.baseFontSize || (appMode === 'bible' ? currentSlide.fontScale?.fontSize : 42) || 42;
  const mainFontPx = ptToCssPreviewPx(ptSize, boxWidth);
  const refFontPx = Math.max(20, mainFontPx * 0.65);
  const titleMultiplier = 1.5;

  const layout = settings.layout || 'center';
  const layoutClasses = isTitle ? 'items-center justify-center text-center' : {
    center: 'items-center justify-center text-center',
    left:   'items-start justify-center text-left pl-[10%] pr-[15%]'
  }[layout] || 'items-center justify-center text-center';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      style={{ cursor: 'none' }}
      onMouseMove={(e) => {
         e.currentTarget.style.cursor = 'default';
         clearTimeout(window.presentationCursorTimeout);
         window.presentationCursorTimeout = setTimeout(() => {
           e.currentTarget.style.cursor = 'none';
         }, 2000);
      }}
    >
      <div 
        className="relative overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
        style={{ ...boxStyle, ...backgroundStyle }}
      >
        {settings.bgImageUrl?.trim() && <div className="absolute inset-0 bg-black/40" />}
        
        <div className={`relative flex-1 flex flex-col p-[8%] ${layoutClasses}`}>
          <div className="w-[90%] mx-auto">
            <p
              className="font-bold whitespace-pre-wrap tracking-tight animate-in fade-in zoom-in-95 duration-500"
              style={{
                fontFamily: appMode === 'lyrics' && !isTitle ? "'Montserrat', 'Inter', sans-serif" : settings.fontFamily,
                fontSize: `${isTitle ? mainFontPx * titleMultiplier : mainFontPx}px`,
                color: settings.fontColor,
                lineHeight: isTitle ? 1.2 : 1.4,
                textShadow: '0 8px 24px rgba(0,0,0,0.8)',
              }}
            >
              {text}
            </p>
            {refText && (
              <p
                className={`transition-all duration-300 ${isTitle ? 'mt-12 opacity-80' : 'mt-12'} animate-in fade-in slide-in-from-bottom-4 duration-700`}
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${isTitle ? refFontPx * titleMultiplier : refFontPx}px`,
                  color: settings.fontColor,
                  fontStyle: 'italic',
                  opacity: 0.8,
                  textShadow: '0 4px 8px rgba(0,0,0,0.6)',
                }}
              >
                {isTitle ? `— ${refText} —` : `— ${refText}`}
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500/60 transition-all duration-500" style={{ width: `${((currentIdx + 1) / totalSlides) * 100}%` }} />
      </div>

      <div className="absolute inset-x-0 bottom-12 flex justify-between px-12 items-center group/nav opacity-0 hover:opacity-100 transition-opacity z-50">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
          className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-2xl active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="bg-black/50 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 text-white font-black tracking-[0.2em] text-sm shadow-2xl">
          {currentIdx + 1} <span className="opacity-20 mx-2">/</span> {totalSlides}
        </div>

        <button 
          onClick={() => setCurrentIdx(prev => Math.min(prev + 1, totalSlides - 1))}
          className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-2xl active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <button 
        onClick={() => document.exitFullscreen()}
        className="absolute top-8 right-8 p-4 bg-black/40 hover:bg-red-500/40 backdrop-blur-xl rounded-2xl text-white/30 hover:text-white transition-all border border-white/5 hover:border-red-500/20 shadow-2xl opacity-0 hover:opacity-100 z-50"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
