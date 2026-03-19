/**
 * lyricsParser.js
 * Parses raw lyric text into an array of clean, individual slide strings.
 */

export function parseLyrics(rawText, linesPerSlide = 2) {
  if (!rawText) return [];

  // 1. Split into lines first to handle line-by-line structural labels
  const rawLines = rawText.split(/\r?\n/);
  
  const cleanLines = rawLines
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      
      // Remove common "internet noise" labels even without brackets
      // regex to match lines that are JUST a label like "Verse 1", "Chorus", "Bridge", etc.
      // Also catches things like "Verse 1:", "Chorus - 1", etc.
      const isStructuralLabel = /^(verse|chorus|bridge|outro|intro|tag|hook|interlude|refrain|pre-chorus|prechorus|split)(\s*[.\-#\d]+)?(\s*:)?$/gi.test(line);
      if (isStructuralLabel) return false;

      // Filter out lines that are just a single short word ending in a colon (almost certainly a label)
      if (line.endsWith(':') && line.split(' ').length <= 2) return false;

      // Remove lines that are just bracketed or parenthesized noise
      if (/^\[.*?\]$/g.test(line) || /^\(.*?\)$/g.test(line)) return false;

      // Filter out repeat instructions
      if (/repeat|x\s*\d+|\d+\s*x/gi.test(line) && line.length < 15) return false;

      return true;
    })
    .map(line => {
      // Inline cleaning for remaining brackets/parentheses within a line of lyrics
      return line.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    })
    .filter(line => line.length > 0);

  // 2. Grouping: Instead of 1 line per slide, group by linesPerSlide
  const groupedSlides = [];
  const count = parseInt(linesPerSlide, 10) || 2;
  for (let i = 0; i < cleanLines.length; i += count) {
    const group = cleanLines.slice(i, i + count);
    groupedSlides.push(group.join('\n'));
  }

  return groupedSlides;
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
