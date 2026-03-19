/**
 * pptxGenerator.js
 * Creates and triggers a .pptx download using PptxGenJS.
 * All generation happens entirely in the browser (no backend required).
 */

import pptxgen from 'pptxgenjs';
import { getScaledFont } from './fontScaler.js';
import { getLyricsFontSize } from './lyricsParser.js';

/**
 * @typedef {Object} SlideSettings
 * @property {string} verseText    - The scripture body text
 * @property {string} verseRef     - The verse reference (e.g. "John 3:16")
 * @property {string} bgColor      - Hex background color (e.g. "#1a1a2e")
 * @property {string} bgImageUrl   - Optional background image URL (overrides bgColor)
 * @property {string} fontFamily   - Font family name string
 * @property {string} fontColor    - Hex font color (e.g. "#FFFFFF")
 * @property {'center'|'top'} layout - Text vertical alignment
 */

/**
 * Sanitizes a hex color string for PptxGenJS (strips leading #).
 * @param {string} color
 * @returns {string}
 */
function sanitizeHex(color) {
  return color?.replace(/^#/, '') ?? 'FFFFFF';
}

/**
 * Generates a .pptx file with multiple verse slides and triggers a browser download.
 *
 * @param {Array} slides - Array of slide objects (for Bible mode)
 * @param {Object} settings - Global slide settings
 * @param {string} appMode - 'bible' | 'lyrics'
 * @param {string[]} lyricsSlides - Array of lyric lines (for Lyrics mode)
 * @returns {Promise<void>}
 */
export async function generateAndDownloadPptx(slides, settings, appMode = 'bible', lyricsSlides = []) {
  // Instantiate PptxGenJS
  const pres = new pptxgen();

  // Standard widescreen 16:9
  pres.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

  let firstValidRef = null;

  if (appMode === 'bible') {
    for (const slideData of slides) {
      const { verseState } = slideData;
      const { verseText, verseRef } = verseState;

      // Skip empty slides
      if (!verseText) continue;

      if (!firstValidRef && verseRef) {
        firstValidRef = verseRef;
      }

      const fullText = `${verseText}\n\n— ${verseRef}`;
      const { fontSize } = getScaledFont(fullText);

      const slide = pres.addSlide();

      // Background
      if (settings.bgImageUrl && settings.bgImageUrl.trim().length > 0) {
        try { slide.background = { path: settings.bgImageUrl.trim() }; } catch { slide.background = { color: sanitizeHex(settings.bgColor) }; }
      } else {
        slide.background = { color: sanitizeHex(settings.bgColor) };
      }

      // Determine alignment based on layout setting
      const layout = settings.layout || 'center';
      const valign = (layout === 'top') ? 'top' : (layout === 'bottom') ? 'bottom' : 'middle';
      const align = (layout === 'left') ? 'left' : 'center';

      const padding = 0.5;
      slide.addText(
        [
          { text: verseText, options: { fontSize: settings.baseFontSize || fontSize, fontFace: settings.fontFamily, color: sanitizeHex(settings.fontColor), breakLine: true } },
          { text: '', options: { breakLine: true } },
          { text: `— ${verseRef}`, options: { fontSize: Math.max(14, (settings.baseFontSize || fontSize) * 0.65), fontFace: settings.fontFamily, color: sanitizeHex(settings.fontColor), italic: true } },
        ],
        { x: padding, y: padding, w: 13.33 - padding * 2, h: 7.5 - padding * 2, valign, align, wrap: true, fit: 'shrink' }
      );
    }
  } else {
    // Lyrics Mode
    for (const line of lyricsSlides) {
      const fontSize = getLyricsFontSize(line);
      const slide = pres.addSlide();

      // Background
      if (settings.bgImageUrl && settings.bgImageUrl.trim().length > 0) {
        try { slide.background = { path: settings.bgImageUrl.trim() }; } catch { slide.background = { color: sanitizeHex(settings.bgColor) }; }
      } else {
        slide.background = { color: sanitizeHex(settings.bgColor) };
      }

      const layout = settings.layout || 'center';
      const valign = (layout === 'top') ? 'top' : (layout === 'bottom') ? 'bottom' : 'middle';
      const align = (layout === 'left') ? 'left' : 'center';

      const padding = 0.8;
      slide.addText(
        [{ text: line, options: { fontSize: settings.baseFontSize || fontSize, fontFace: "'Inter', Arial", color: sanitizeHex(settings.fontColor), bold: true } }],
        { x: padding, y: padding, w: 13.33 - padding * 2, h: 7.5 - padding * 2, valign, align, wrap: true, fit: 'shrink' }
      );
    }
    firstValidRef = "Lyrics";
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split('T')[0]; // e.g. 2026-03-16
  let fileName = '';

  if (appMode === 'bible') {
    const baseName = firstValidRef 
      ? firstValidRef.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
      : 'Verse';
    fileName = `${baseName}_Bible_Slide_${dateStr}.pptx`;
  } else {
    fileName = `Song_Lyrics_${dateStr}.pptx`;
  }
  
  await pres.writeFile({ fileName });
}
