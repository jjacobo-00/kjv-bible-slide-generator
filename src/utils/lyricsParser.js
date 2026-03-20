/**
 * lyricsParser.js
 * Parses raw lyric text into an array of clean, individual slide strings.
 */

export function parseLyrics(rawText, linesPerSlide = 2, songTitle = '') {
  const slides = [];

  // Prepend Title Slide
  if (songTitle && songTitle.trim()) {
    slides.push({
      text: songTitle.trim(),
      refText: '',
      type: 'title'
    });
  }

  if (!rawText) return slides;

  // 1. Split into lines and clean
  const rawLines = rawText.split(/\r?\n/);
  const cleanLines = rawLines
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      const isStructuralLabel = /^(verse|chorus|bridge|outro|intro|tag|hook|interlude|refrain|pre-chorus|prechorus|split)(\s*[.\-#\d]+)?(\s*:)?$/gi.test(line);
      if (isStructuralLabel) return false;
      if (line.endsWith(':') && line.split(' ').length <= 2) return false;
      if (/^\[.*?\]$/g.test(line) || /^\(.*?\)$/g.test(line)) return false;
      if (/repeat|x\s*\d+|\d+\s*x/gi.test(line) && line.length < 15) return false;
      return true;
    })
    .map(line => line.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim())
    .filter(line => line.length > 0);

  // 2. Grouping
  const count = parseInt(linesPerSlide, 10) || 2;
  for (let i = 0; i < cleanLines.length; i += count) {
    const group = cleanLines.slice(i, i + count);
    slides.push({
      text: group.join('\n'),
      type: 'lyrics'
    });
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
