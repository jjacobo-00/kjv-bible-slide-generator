/**
 * AdminPanel.jsx
 * Sidebar control panel for the CBT KJV Bible & Lyrics Generator.
 * Manages verse fetching, appearance settings, and export.
 */

import { useState, useEffect, useRef } from 'react';
import { generateAndDownloadPptx } from '../utils/pptxGenerator.js';
import { getAutocompleteSuggestions } from '../utils/bibleApi.js';
import SlideOrganizerModal from './SlideOrganizerModal';
import logo from '../assets/logo.svg';

// ── Font Options ──────────────────────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Lora', value: 'Lora' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Source Serif 4', value: 'Source Serif 4' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Verdana', value: 'Verdana' },
];

// ── Preset Color Swatches ────────────────────────────────────────────────────
const BG_PRESETS = [
  '#1a1a2e', '#0f3460', '#16213e', '#1b4332', '#370617',
  '#2d2d2d', '#000000', '#FFFFFF', '#212529', '#3d5a80',
];

const FONT_PRESETS = [
  '#FFFFFF', '#F8F1E0', '#FFD700', '#A8EDEA', '#FFC3A0',
  '#E0E0E0', '#FDFFB6', '#C8E6C9', '#000000', '#2d2d2d',
];

// ── Reusable subcomponents ────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
      {children}
    </p>
  );
}

function ColorSwatches({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {colors.map((c) => (
        <button
          key={c}
          title={c}
          onClick={() => onSelect(c)}
          style={{ backgroundColor: c }}
          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none ${
            selected === c
              ? 'border-indigo-400 scale-110'
              : 'border-slate-600 hover:border-slate-400'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Array}    props.slides
 * @param {string|number} props.activeSlideId
 * @param {Object}   props.activeSlide
 * @param {Function} props.onSetActiveSlide
 * @param {Function} props.onAddSlide
 * @param {Function} props.onRemoveSlide
 * @param {Function} props.onSettingsChange
 * @param {Function} props.onVerseQueryChange
 * @param {Function} props.onFetchVerse
 * @param {Object}   props.fontScale
 */
export default function AdminPanel({
  settings,
  slides,
  activeSlideId,
  activeSlide,
  onSetActiveSlide,
  onAddSlide,
  onRemoveSlide,
  onSettingsChange,
  onVerseQueryChange,
  onFetchVerse,
  fontScale,
  appMode,
  onSetAppMode,
  lyricsRawText,
  onLyricsChange,
  lyricsSlides,
  onReorderSave,
  onShowHelp,
}) {
  const verseState = activeSlide.verseState;
  const verseQuery = activeSlide.verseQuery;

  const [isExporting, setIsExporting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [isReordering, setIsReordering] = useState(false);
  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef({});

  // Auto-center active thumbnail
  useEffect(() => {
    if (activeSlideId && thumbnailRefs.current[activeSlideId]) {
      thumbnailRefs.current[activeSlideId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSlideId]);

  const fetchSuggestions = async (q) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const results = await getAutocompleteSuggestions(q);
    setSuggestions(results);
  };

  // Keep suggestions updated if activeSlide changes query externally
  useEffect(() => {
    if (activeSlideId && !showSuggestions) {
      fetchSuggestions(verseQuery);
    }
  }, [verseQuery, activeSlideId]);

  // Generic updater helper
  const update = (key) => (e) => onSettingsChange(key, e.target.value);

  // Handle verse fetch on Enter or button click
  const handleFetch = () => onFetchVerse(verseQuery);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch();
  };

  const hasAnyVerse = slides.some(s => s.verseState.verseText);

  // Export handler
  const handleExport = async () => {
    const canExport = appMode === 'bible' ? hasAnyVerse : (lyricsSlides && lyricsSlides.length > 0);
    if (!canExport) return;

    setIsExporting(true);
    try {
      await generateAndDownloadPptx(slides, settings, appMode, lyricsSlides);
    } catch (err) {
      console.error('PPTX generation failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="w-80 min-w-[280px] flex-shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col h-screen overflow-y-auto shadow-2xl">
      <div className="px-6 py-8 border-b border-slate-700/60 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-xl" />
          <div className="flex flex-col">
            <h1 className="text-[0.95rem] font-extrabold text-white tracking-tight leading-[1.2]">
              CBT KJV Bible &<br/>Lyrics Generator
            </h1>
          </div>
        </div>
        <button 
          onClick={onShowHelp}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-indigo-400 hover:text-white transition-all shadow-lg shrink-0 animate-help-pulse"
          title="Show Help Guide"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-3 flex border-b border-slate-700/50">
        <button
          onClick={() => onSetAppMode('bible')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-l-md transition-colors ${
            appMode === 'bible'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Bible
        </button>
        <button
          onClick={() => onSetAppMode('lyrics')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-r-md transition-colors ${
            appMode === 'lyrics'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Lyrics
        </button>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5 flex-1">

        {/* ── Slide Content Input (Bible vs Lyrics) ── */}
        {appMode === 'bible' ? (
          <>
            {/* ── Slides Manager ── */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SectionLabel>Slides</SectionLabel>
                  <button
                    onClick={() => setIsReordering(!isReordering)}
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded transition-all ${
                      isReordering 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isReordering ? 'Done' : 'Edit'}
                  </button>
                </div>
                <button
                   onClick={onAddSlide}
                   className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                   title="Add new slide"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="relative group/slides">
                <div 
                  ref={thumbnailContainerRef}
                  className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 custom-scrollbar no-scrollbar transition-all scroll-smooth"
                >
                  {slides.map((s, index) => {
                    const parts = s.verseState.verseRef?.split(' ') || [];
                    const book = parts.slice(0, -1).join(' ');
                    const chapVer = parts.slice(-1)[0];
                    
                    // Thumbnail bg matches global style
                    const thumbBg = settings.bgImageUrl 
                      ? { backgroundImage: `url(${settings.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { backgroundColor: settings.bgColor };

                    return (
                      <div 
                        key={s.id} 
                        ref={el => thumbnailRefs.current[s.id] = el}
                        className={`group relative h-16 w-24 rounded-xl border shrink-0 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                          activeSlideId === s.id
                            ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 -translate-y-1 scale-105 z-10'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                        onClick={() => onSetActiveSlide(s.id)}
                      >
                        {/* Mini Background Layer */}
                        <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60" style={thumbBg} />
                        <div className={`absolute inset-0 transition-colors ${activeSlideId === s.id ? 'bg-indigo-900/40' : 'bg-slate-900/60'}`} />

                        <div className="relative z-10 flex flex-col items-center">
                          <span className={`text-xl font-black tracking-tight leading-none ${activeSlideId === s.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            {index + 1}
                          </span>
                          
                          {/* Split reference for visibility */}
                          {s.verseState.verseRef && (
                            <div className={`flex flex-col items-center leading-none mt-1 ${activeSlideId === s.id ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>
                               <span className="text-[7px] font-black uppercase tracking-tighter truncate w-20 text-center">
                                 {book}
                               </span>
                               <span className="text-[10px] font-black tracking-tight mt-0.5 font-mono">
                                 {chapVer}
                               </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Hover Delete Button */}
                        {slides.length > 1 && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onRemoveSlide(s.id); 
                            }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg scale-75 group-hover:scale-100 z-20"
                            title="Delete slide"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}

                        {/* Active indicator bar */}
                        {activeSlideId === s.id && (
                           <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 animate-pulse" />
                        )}
                      </div>
                    );
                  })}

                  {/* Inline Add Button (Quick Access) */}
                  <button
                     onClick={onAddSlide}
                     className="h-14 w-12 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all shrink-0"
                     title="Add new slide"
                  >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                     </svg>
                  </button>
                </div>
                {/* Fade indicators */}
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none opacity-0 group-hover/slides:opacity-100 transition-opacity" />
              </div>
            </section>

            {/* Slide Organizer Modal */}
            {isReordering && (
              <SlideOrganizerModal 
                slides={slides} 
                settings={settings}
                onClose={() => setIsReordering(false)}
                onSave={(newSlides) => {
                  onReorderSave(newSlides);
                  setIsReordering(false);
                }}
              />
            )}
            
            <div className="border-t border-slate-700/50" />

            {/* ── Verse Lookup ── */}
            <section className="relative">
              <SectionLabel>Scripture Reference</SectionLabel>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={verseQuery}
                    onChange={(e) => {
                      onVerseQueryChange(e.target.value);
                      fetchSuggestions(e.target.value);
                      setShowSuggestions(true);
                      setSuggestionIndex(-1);
                    }}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSuggestionIndex(i => Math.min(i + 1, suggestions.length - 1));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSuggestionIndex(i => Math.max(i - 1, -1));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
                          onVerseQueryChange(suggestions[suggestionIndex]);
                          setShowSuggestions(false);
                          // Don't auto-fetch if we're just completing a book or chapter (ends with space or colon)
                          if (!suggestions[suggestionIndex].endsWith(' ') && !suggestions[suggestionIndex].endsWith(':')) {
                            setTimeout(() => handleFetch(), 50);
                          } else {
                            // Let them keep typing
                            const newQ = suggestions[suggestionIndex];
                            fetchSuggestions(newQ);
                          }
                        } else {
                          handleFetch();
                          setShowSuggestions(false);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="e.g. John 3:16"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                    autoComplete="off"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                      {suggestions.map((sug, i) => (
                        <li
                          key={sug}
                          onClick={() => {
                            onVerseQueryChange(sug);
                            setShowSuggestions(false);
                            if (!sug.endsWith(' ') && !sug.endsWith(':')) {
                              setTimeout(() => onFetchVerse(sug), 50);
                            } else {
                               fetchSuggestions(sug);
                               setTimeout(() => setShowSuggestions(true), 10);
                            }
                          }}
                          onMouseEnter={() => setSuggestionIndex(i)}
                          className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                            i === suggestionIndex ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {sug}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <button
                  onClick={() => { setShowSuggestions(false); handleFetch(); }}
                  disabled={verseState.loading}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {verseState.loading ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Loading</span>
                    </>
                  ) : (
                    'Fetch'
                  )}
                </button>
              </div>

              {/* Error state */}
              {verseState.error && (
                <div className="mt-2 px-3 py-2 bg-red-900/40 border border-red-700/50 rounded-lg text-xs text-red-300">
                  ⚠ {verseState.error}
                </div>
              )}

              {/* Overflow warning */}
              {fontScale?.overflow && verseState.verseText && (
                <div className="mt-2 px-3 py-2 bg-amber-900/40 border border-amber-700/50 rounded-lg text-xs text-amber-300">
                  ⚠ This verse is very long ({verseState.verseText.length + (verseState.verseRef?.length ?? 0)} chars). Text may overflow the slide. Consider splitting into multiple slides.
                </div>
              )}

              {/* Font size indicator */}
              {fontScale && verseState.verseText && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Auto font size:</span>
                  <span className="text-xs font-medium text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-full">
                    {fontScale.sizeLabel}
                  </span>
                </div>
              )}
            </section>
          </>
        ) : (
          /* ── Lyrics Input ── */
          <section className="flex flex-col flex-1 min-h-0">
            <SectionLabel>Song Title (Optional)</SectionLabel>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                value={settings.songTitle}
                onChange={update('songTitle')}
                placeholder="e.g. Amazing Grace"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <SectionLabel>Song Lyrics</SectionLabel>
            <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
              Paste song lyrics below. Each non-empty line becomes a slide. 
              Labels like [Verse 1] or Chorus are automatically filtered out.
            </p>
            <textarea
              value={lyricsRawText}
              onChange={(e) => onLyricsChange(e.target.value)}
              placeholder="Paste lyrics here..."
              className="flex-1 min-h-[200px] w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none font-mono mb-4"
            />

            <SectionLabel>Lyrics Layout</SectionLabel>
            <div className="flex gap-2">
              {[
                { label: 'Standard (2 lines)', value: 2 },
                { label: 'Compact (4 lines)', value: 4 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSettingsChange('lyricsLinesPerSlide', opt.value)}
                  className={`flex-1 py-2 px-1 rounded-lg border text-[10px] font-bold transition-all ${
                    settings.lyricsLinesPerSlide === opt.value
                      ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                      : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-slate-700/50" />

        {/* ── Background ── */}
        <section>
          <SectionLabel>Background</SectionLabel>

          {/* BG Color picker */}
          <div className="flex items-center gap-2.5 mb-2">
            <label className="text-xs text-slate-400 w-16 shrink-0">Color</label>
            <input
              type="color"
              value={settings.bgColor}
              onChange={update('bgColor')}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-slate-600 p-0.5"
            />
            <span className="text-xs text-slate-500 font-mono">{settings.bgColor}</span>
          </div>
          <ColorSwatches
            colors={BG_PRESETS}
            selected={settings.bgColor}
            onSelect={(c) => onSettingsChange('bgColor', c)}
          />

          {/* BG Image Selection */}
          <div className="mt-3">
            <label className="text-xs text-slate-400 block mb-1.5">Background Image</label>
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={settings.bgImageUrl}
                onChange={update('bgImageUrl')}
                placeholder="https://example.com/bg.jpg"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          onSettingsChange('bgImageUrl', event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                
                {settings.bgImageUrl && (
                  <button
                    onClick={() => onSettingsChange('bgImageUrl', '')}
                    className="p-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg transition-colors"
                    title="Clear background"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-700/50" />

        {/* ── Font ── */}
        <section>
          <SectionLabel>Typography</SectionLabel>

          {/* Base Font Size */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 flex justify-between mb-1">
              <span>Base Font Size</span>
              <span className="text-indigo-400 font-mono">{settings.baseFontSize}pt</span>
            </label>
            <input
              type="range"
              min="16"
              max="120"
              value={settings.baseFontSize}
              onChange={(e) => onSettingsChange('baseFontSize', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 hover:accent-indigo-400 transition-all cursor-pointer"
            />
          </div>

          {/* Font Family */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={update('fontFamily')}
              style={{ fontFamily: settings.fontFamily }}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Color */}
          <div className="flex items-center gap-2.5 mb-2">
            <label className="text-xs text-slate-400 w-16 shrink-0">Color</label>
            <input
              type="color"
              value={settings.fontColor}
              onChange={update('fontColor')}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-slate-600 p-0.5"
            />
            <span className="text-xs text-slate-500 font-mono">{settings.fontColor}</span>
          </div>
          <ColorSwatches
            colors={FONT_PRESETS}
            selected={settings.fontColor}
            onSelect={(c) => onSettingsChange('fontColor', c)}
          />
        </section>

        <div className="border-t border-slate-700/50" />

        {/* ── Layout ── */}
        <section>
          <SectionLabel>Slide Layout</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'center', label: 'Centered', icon: <path d="M12 3v18M3 12h18" strokeDasharray="2 2"/> },
              { id: 'left', label: 'Left Aligned', icon: <path d="M4 5v14M9 8l-4 4 4 4M5 12h13" /> }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => onSettingsChange('layout', l.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  (settings.layout || 'center') === l.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
                title={l.label}
              >
                <svg className="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  {l.icon}
                </svg>
                <span className="text-[9px] uppercase font-black tracking-tight">{l.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Export Button ── */}
      <div className="px-5 py-4 border-t border-slate-700/60 bg-slate-900/80">
        <button
          onClick={handleExport}
          disabled={(appMode === 'bible' ? !hasAnyVerse : lyricsRawText.trim().length === 0) || isExporting}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
            ((appMode === 'bible' && hasAnyVerse) || (appMode === 'lyrics' && lyricsRawText.trim().length > 0)) && !isExporting
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer hover:shadow-indigo-500/30 hover:shadow-xl active:scale-95'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating PPTX…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PPTX
            </>
          )}
        </button>
        {!hasAnyVerse && appMode === 'bible' && (
          <p className="text-center text-xs text-slate-600 mt-2">
            Fetch a verse to enable export
          </p>
        )}
        {lyricsRawText.trim().length === 0 && appMode === 'lyrics' && (
          <p className="text-center text-xs text-slate-600 mt-2">
            Paste lyrics to enable export
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 text-center border-t border-slate-800/40">
        <p className="text-[10px] text-slate-500 font-medium">
          © {new Date().getFullYear()} All rights reserved.
          <br />
          Christian Baptist Tabernacle
        </p>
      </div>
    </aside>
  );
}
