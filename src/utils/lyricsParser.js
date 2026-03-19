/**
 * lyricsParser.js
 * Parses raw lyric text into an array of clean, individual slide strings.
 */

export function parseLyrics(rawText, linesPerSlide = 2, settings = {}) {
  if (!rawText) return [];

  const rawLines = rawText.split(/\r?\n/);
  const slides = [];
  let currentGroup = [];
  let isInChorus = false;

  const count = parseInt(linesPerSlide, 10) || 2;

  // 1. Add Title Slide if exists
  if (settings.songTitle || settings.songAuthor) {
    slides.push({
      type: 'title',
      text: settings.songTitle || 'Untitled',
      refText: settings.songAuthor || '',
      isChorus: false
    });
  }

  for (let line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for structural labels (Chorus, Verse, etc.)
    const chorusMatch = /^(chorus|refrain)/gi.test(trimmed) || /^\[chorus\]/gi.test(trimmed);
    const otherLabelMatch = /^(verse|bridge|outro|intro|tag|hook|interlude|pre-chorus|prechorus|split)/gi.test(trimmed) || /^\[.*?\]/gi.test(trimmed);

    if (chorusMatch) {
      // Flush current group if we switch to chorus
      if (currentGroup.length > 0) {
        slides.push({ type: 'lyrics', text: currentGroup.join('\n'), isChorus: isInChorus });
        currentGroup = [];
      }
      isInChorus = true;
      continue;
    }

    if (otherLabelMatch) {
      // Flush current group if we switch section
      if (currentGroup.length > 0) {
        slides.push({ type: 'lyrics', text: currentGroup.join('\n'), isChorus: isInChorus });
        currentGroup = [];
      }
      isInChorus = false;
      continue;
    }

    currentGroup.push(trimmed);

    if (currentGroup.length >= count) {
      slides.push({ type: 'lyrics', text: currentGroup.join('\n'), isChorus: isInChorus });
      currentGroup = [];
    }
  }

  // Flush remaining
  if (currentGroup.length > 0) {
    slides.push({ type: 'lyrics', text: currentGroup.join('\n'), isChorus: isInChorus });
  }

  return slides;
}

/**
 * Scaler specifically for lyrics to ensure they stay on one line or fit nicely.
 */
export function getLyricsFontSize(text = '') {
  const len = text.length;
  // lyrics usually want to be bigger and bolder
  // Grouping 2 lines means typical length is 40-80 chars
  if (len < 30) return 64;
  if (len < 60) return 52;
  if (len < 100) return 40;
  if (len < 140) return 32;
  return 24;
}
