/**
 * SlidePreview.jsx
 * Live visual preview card that mirrors exactly how the PPTX slide will look.
 * Maintains a 16:9 (widescreen) aspect ratio and updates in real-time.
 */

import { useMemo, useRef, useEffect } from 'react';
import { ptToCssPreviewPx } from '../utils/fontScaler.js';
import { getLyricsFontSize } from '../utils/lyricsParser.js';


/**
 * @param {Object} props
 * @param {Object}   props.settings   - Slide appearance settings
 * @param {string}   props.appMode    - 'bible' | 'lyrics'
 * @param {string}   props.verseText  - The verse body text
 * @param {string}   props.verseRef   - The verse reference string
 * @param {Object}   props.fontScale  - { fontSize, overflow, sizeLabel }
 * @param {string[]} props.lyricsSlides - Array of lyric lines
 * @param {Function} props.onSettingsChange - Callback to update global settings
 */
export default function SlidePreview({ settings, appMode, verseText, verseRef, fontScale, lyricsSlides = [], onSettingsChange }) {
  const containerRef = useRef(null);

  // We'll track the container width to calculate responsive font sizes
  const previewWidth = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      previewWidth.current = containerRef.current.offsetWidth;
    }
  });

  // Compute CSS pixel font sizes from pt values using the preview card width
  const mainFontPx = useMemo(() => {
    const ptSize = settings.baseFontSize || fontScale?.fontSize || 42;
    // Use a base width of 800px for the conversion calculation
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

  const hasVerse = verseText && verseText.trim().length > 0;
  const hasLyrics = lyricsSlides.length > 0;

  // Components for the individual slide core logic (reused for lyrics feeds)
  const SlideCard = ({ text, refText, isLyric = false }) => {
    // Dynamic lyrics sizing
    const lyricFontSizePt = isLyric ? (settings.baseFontSize || getLyricsFontSize(text)) : (settings.baseFontSize || fontScale?.fontSize || 42);
    const lyricFontSizePx = ptToCssPreviewPx(lyricFontSizePt, 800);

    return (
      <div
        className="group relative shadow-2xl shadow-black/60 rounded-sm overflow-hidden ring-1 ring-white/10 w-full mb-8 last:mb-0 transition-transform duration-300 hover:scale-[1.01]"
        style={{ aspectRatio: '16 / 9', maxWidth: '1000px' }}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={backgroundStyle}
        />

        {/* Dark overlay if background image is present */}
        {settings.bgImageUrl?.trim() && (
          <div className="absolute inset-0 bg-black/20" />
        )}

        {/* Content area */}
        <div
          className={`absolute inset-0 flex flex-col px-[8%] py-[8%] items-center ${
            settings.layout === 'top' ? 'justify-start' : 'justify-center'
          }`}
        >
          <div className="w-full text-center">
            {/* The primary text */}
            <p
              className="leading-snug transition-all duration-300 font-bold whitespace-pre-wrap"
              style={{
                fontFamily: isLyric ? "'Montserrat', 'Inter', sans-serif" : settings.fontFamily,
                fontSize: `${isLyric ? lyricFontSizePx : mainFontPx}px`,
                color: settings.fontColor,
                lineHeight: 1.25,
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {text}
            </p>

            {/* Sub-text / Reference if applicable */}
            {refText && (
              <p
                className="mt-4 transition-all duration-300"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${refFontPx}px`,
                  color: settings.fontColor,
                  fontStyle: 'italic',
                  opacity: 0.85,
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                — {refText}
              </p>
            )}
          </div>
        </div>

        {/* Corner watermark */}
        <div className="absolute bottom-2 right-3 text-white/20 text-[9px] font-mono select-none pointer-events-none">
          {isLyric ? 'SONG' : 'KJV'}
        </div>

        {/* Layout Position Toggles */}
        <div className="absolute top-4 right-4 flex gap-1.5 overflow-hidden rounded-lg bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 translate-y-1 group-hover:translate-y-0 translate-x-1 group-hover:translate-x-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onSettingsChange('layout', 'center'); }}
            className={`p-1.5 rounded-md transition-all ${settings.layout === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            title="Center Alignment"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h16" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onSettingsChange('layout', 'top'); }}
            className={`p-1.5 rounded-md transition-all ${settings.layout === 'top' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            title="Top Alignment"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 5h16" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h12M4 15h8" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-[#0a0c14] p-8 overflow-y-auto min-h-0 custom-scrollbar">
      {/* Header Label */}
      <div className="flex items-center gap-2 mb-6 self-start">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
          {appMode === 'bible' ? 'Bible Verse Preview' : 'Song Lyrics Preview'}
        </span>
      </div>

      <div ref={containerRef} className="w-full flex flex-col items-center">
        {appMode === 'bible' ? (
          hasVerse ? (
            <SlideCard text={verseText} refText={verseRef} />
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
              <SlideCard key={`${idx}-${line}`} text={line} isLyric={true} />
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

      {/* Metadata / Status Bar */}
      {(appMode === 'bible' && hasVerse) && (
        <div className="flex items-center gap-4 mt-6 py-2 px-4 bg-slate-900/50 rounded-full border border-slate-800/50 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-500"/> Bible Mode</span>
          <span className="w-px h-3 bg-slate-800"/>
          <span>{verseText.length + (verseRef?.length ?? 0)} chars</span>
          <span className="w-px h-3 bg-slate-800"/>
          <span className="text-indigo-400 capitalize">{settings.layout}</span>
        </div>
      )}

      {(appMode === 'lyrics' && hasLyrics) && (
        <div className="flex items-center gap-4 mt-6 py-2 px-4 bg-slate-900/50 rounded-full border border-slate-800/50 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-purple-500"/> Lyrics Mode</span>
          <span className="w-px h-3 bg-slate-800"/>
          <span>{lyricsSlides.length} slides generated</span>
          <span className="w-px h-3 bg-slate-800"/>
          <span className="text-purple-400">Centered Layout</span>
        </div>
      )}
    </div>
  );
}
