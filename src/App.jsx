/**
 * App.jsx
 * Root component: manages global state and orchestrates the layout.
 * Sidebar (AdminPanel) + Main area (SlidePreview).
 */

import { useState, useMemo } from 'react';
import AdminPanel from './components/AdminPanel.jsx';
import SlidePreview from './components/SlidePreview.jsx';
import { fetchBibleVerse } from './utils/bibleApi.js';
import { getScaledFont } from './utils/fontScaler.js';
import { parseLyrics } from './utils/lyricsParser.js';

// ── Default Settings ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  bgColor: '#1a1a2e',
  bgImageUrl: '',
  fontFamily: 'Playfair Display',
  fontColor: '#F8F1E0',
  layout: 'center', // 'center' | 'top'
  lyricsLinesPerSlide: 2,
  baseFontSize: 42, 
  songTitle: '',
  songAuthor: '',
};

const createNewSlide = (id, verseText = null, verseRef = null) => ({
  id,
  verseState: { verseText, verseRef, loading: false, error: null },
  verseQuery: verseRef || 'John 3:16'
});

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [appMode, setAppMode] = useState('bible'); // 'bible' | 'lyrics'
  const [slides, setSlides] = useState([
    createNewSlide(
      Date.now(),
      "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      "John 3:16"
    ),
  ]);
  const [activeSlideId, setActiveSlideId] = useState(slides[0].id);
  const [lyricsRawText, setLyricsRawText] = useState('');

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  const updateActiveSlide = (updater) => {
    setSlides((prev) => prev.map((s) => (s.id === activeSlideId ? updater(s) : s)));
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleVerseQueryChange = (query) => {
    updateActiveSlide((s) => ({ ...s, verseQuery: query }));
  };

  const handleFetchVerse = async (query) => {
    updateActiveSlide((s) => ({
      ...s,
      verseState: { ...s.verseState, loading: true, error: null },
    }));
    try {
      const results = await fetchBibleVerse(query);
      if (!results || results.length === 0) throw new Error('No verses found');

      setSlides((prev) => {
        const activeIndex = prev.findIndex((s) => s.id === activeSlideId);
        if (activeIndex === -1) return prev;

        const newSlides = [...prev];
        // 1. Update the current active slide with result #1
        newSlides[activeIndex] = {
          ...newSlides[activeIndex],
          verseState: { 
            ...newSlides[activeIndex].verseState, 
            verseText: results[0].verseText, 
            verseRef: results[0].verseRef, 
            loading: false 
          },
        };

        // 2. If it's a range, insert additional slides after this one
        if (results.length > 1) {
          const insertTime = Date.now();
          const extraSlides = results.slice(1).map((res, idx) => ({
            id: insertTime + idx + 1,
            verseState: { 
              verseText: res.verseText, 
              verseRef: res.verseRef, 
              loading: false, 
              error: null 
            },
            verseQuery: res.verseRef
          }));
          newSlides.splice(activeIndex + 1, 0, ...extraSlides);
        }
        return newSlides;
      });
    } catch (err) {
      updateActiveSlide((s) => ({
        ...s,
        verseState: {
          ...s.verseState,
          error: err.message,
          loading: false,
          verseText: null,
          verseRef: null,
        },
      }));
    }
  };

  const handleAddSlide = () => {
    const newSlide = createNewSlide(Date.now());
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideId(newSlide.id);
  };

  const handleRemoveSlide = (id) => {
    if (slides.length <= 1) return; // Must have at least one slide
    setSlides((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSlideId === id) {
        // If we delete the active slide, focus the one before it (or the first one)
        const deletedIndex = prev.findIndex((s) => s.id === id);
        const newFocusIndex = Math.max(0, deletedIndex - 1);
        setActiveSlideId(filtered[newFocusIndex].id);
      }
      return filtered;
    });
  };

  const handleReorderSlide = (id, direction) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;

      const newSlides = [...prev];
      const [moved] = newSlides.splice(idx, 1);
      newSlides.splice(newIdx, 0, moved);
      return newSlides;
    });
  };

  // Compute font scale info reactively whenever the active slide's verse changes
  const fontScale = useMemo(() => {
    if (appMode === 'lyrics') return null; // Lyrics handled differently
    if (!activeSlide.verseState.verseText) return null;
    const fullText = `${activeSlide.verseState.verseText}\n\n— ${activeSlide.verseState.verseRef ?? ''}`;
    return getScaledFont(fullText);
  }, [activeSlide.verseState.verseText, activeSlide.verseState.verseRef, appMode]);

  const parsedLyrics = useMemo(() => {
    return parseLyrics(lyricsRawText, settings.lyricsLinesPerSlide, settings.songTitle, settings.songAuthor);
  }, [lyricsRawText, settings.lyricsLinesPerSlide, settings.songTitle, settings.songAuthor]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c14]">
      <AdminPanel
        settings={settings}
        appMode={appMode}
        onSetAppMode={setAppMode}
        slides={slides}
        activeSlideId={activeSlideId}
        activeSlide={activeSlide}
        onSetActiveSlide={setActiveSlideId}
        onAddSlide={handleAddSlide}
        onRemoveSlide={handleRemoveSlide}
        onReorderSave={setSlides}
        onSettingsChange={handleSettingsChange}
        onVerseQueryChange={handleVerseQueryChange}
        onFetchVerse={handleFetchVerse}
        fontScale={fontScale}
        lyricsRawText={lyricsRawText}
        onLyricsChange={setLyricsRawText}
        lyricsSlides={parsedLyrics}
      />
      <SlidePreview
        settings={settings}
        appMode={appMode}
        slides={slides}
        activeSlideId={activeSlideId}
        onSetActiveSlide={setActiveSlideId}
        fontScale={fontScale}
        lyricsSlides={parsedLyrics}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
