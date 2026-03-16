/**
 * SlidePreview.jsx
 * Live visual preview card that mirrors exactly how the PPTX slide will look.
 * Maintains a 16:9 (widescreen) aspect ratio and updates in real-time.
 */

import { useMemo, useRef, useEffect } from 'react';
import { getScaledFont, ptToCssPreviewPx } from '../utils/fontScaler.js';

/**
 * @param {Object} props
 * @param {Object}   props.settings   - Slide appearance settings
 * @param {string}   props.verseText  - The verse body text
 * @param {string}   props.verseRef   - The verse reference string
 * @param {Object}   props.fontScale  - { fontSize, overflow, sizeLabel }
 */
export default function SlidePreview({ settings, verseText, verseRef, fontScale }) {
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
    if (!fontScale) return 32;
    // Use a base width of 800px for the conversion calculation
    return ptToCssPreviewPx(fontScale.fontSize, 800);
  }, [fontScale]);

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0c14] p-8 overflow-auto min-h-0">
      {/* Label */}
      <div className="flex items-center gap-2 mb-4 self-start">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          Live Preview · 16:9
        </span>
      </div>

      {/* Slide Card — 16:9 ratio enforced via padding-top trick */}
      <div
        ref={containerRef}
        className="relative w-full shadow-2xl shadow-black/60 rounded-sm overflow-hidden ring-1 ring-white/10"
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
          className={`absolute inset-0 flex flex-col px-[5%] py-[5%] ${
            settings.layout === 'center'
              ? 'items-center justify-center'
              : 'items-start justify-start pt-[7%]'
          }`}
        >
          {hasVerse ? (
            <div
              className={`w-full ${settings.layout === 'center' ? 'text-center' : 'text-left'}`}
            >
              {/* Verse body */}
              <p
                className="leading-snug transition-all duration-300"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${mainFontPx}px`,
                  color: settings.fontColor,
                  lineHeight: 1.4,
                  marginBottom: `${refFontPx * 0.8}px`,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                {verseText}
              </p>

              {/* Reference */}
              <p
                className="transition-all duration-300"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${refFontPx}px`,
                  color: settings.fontColor,
                  fontStyle: 'italic',
                  opacity: 0.85,
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                — {verseRef}
              </p>
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full w-full gap-3 opacity-30">
              <svg
                className="w-12 h-12"
                style={{ color: settings.fontColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p
                className="text-sm font-medium"
                style={{ color: settings.fontColor, fontFamily: settings.fontFamily }}
              >
                Enter a verse reference and click Fetch
              </p>
            </div>
          )}
        </div>

        {/* Corner watermark */}
        {hasVerse && (
          <div className="absolute bottom-2 right-3 text-white/20 text-[9px] font-mono select-none pointer-events-none">
            KJV
          </div>
        )}
      </div>

      {/* Metadata bar below preview */}
      {hasVerse && fontScale && (
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
          <span>
            <span className="text-slate-600">Chars:</span>{' '}
            <span className="text-slate-400">{(verseText.length + (verseRef?.length ?? 0) + 5)}</span>
          </span>
          <span>·</span>
          <span>
            <span className="text-slate-600">Font:</span>{' '}
            <span className="text-slate-400">{fontScale.sizeLabel}</span>
          </span>
          <span>·</span>
          <span>
            <span className="text-slate-600">Layout:</span>{' '}
            <span className="text-slate-400 capitalize">{settings.layout}</span>
          </span>
          {fontScale.overflow && (
            <>
              <span>·</span>
              <span className="text-amber-500">⚠ May overflow</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
