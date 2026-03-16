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

// ── Default Settings ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  bgColor: '#1a1a2e',
  bgImageUrl: '',
  fontFamily: 'Playfair Display',
  fontColor: '#F8F1E0',
  layout: 'center', // 'center' | 'top'
};

const createNewSlide = (id) => ({
  id,
  verseState: { verseText: null, verseRef: null, loading: false, error: null },
  verseQuery: 'John 3:16'
});

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [slides, setSlides] = useState([createNewSlide(Date.now())]);
  const [activeSlideId, setActiveSlideId] = useState(slides[0].id);

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
      const { verseText, verseRef } = await fetchBibleVerse(query);
      updateActiveSlide((s) => ({
        ...s,
        verseState: { ...s.verseState, verseText, verseRef, loading: false },
      }));
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

  // Compute font scale info reactively whenever the active slide's verse changes
  const fontScale = useMemo(() => {
    if (!activeSlide.verseState.verseText) return null;
    const fullText = `${activeSlide.verseState.verseText}\n\n— ${activeSlide.verseState.verseRef ?? ''}`;
    return getScaledFont(fullText);
  }, [activeSlide.verseState.verseText, activeSlide.verseState.verseRef]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c14]">
      <AdminPanel
        settings={settings}
        slides={slides}
        activeSlideId={activeSlideId}
        activeSlide={activeSlide}
        onSetActiveSlide={setActiveSlideId}
        onAddSlide={handleAddSlide}
        onRemoveSlide={handleRemoveSlide}
        onSettingsChange={handleSettingsChange}
        onVerseQueryChange={handleVerseQueryChange}
        onFetchVerse={handleFetchVerse}
        fontScale={fontScale}
      />
      <SlidePreview
        settings={settings}
        verseText={activeSlide.verseState.verseText}
        verseRef={activeSlide.verseState.verseRef}
        fontScale={fontScale}
      />
    </div>
  );
}
