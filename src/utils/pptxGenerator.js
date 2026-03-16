/**
 * pptxGenerator.js
 * Creates and triggers a .pptx download using PptxGenJS.
 * All generation happens entirely in the browser (no backend required).
 */

import pptxgen from 'pptxgenjs';
import { getScaledFont } from './fontScaler.js';

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
 * @param {Array} slides - Array of slide objects { id, verseState }
 * @param {Object} settings - Global slide settings
 * @returns {Promise<void>}
 */
export async function generateAndDownloadPptx(slides, settings) {
  // Instantiate PptxGenJS
  const pres = new pptxgen();

  // Standard widescreen 16:9
  pres.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

  let firstValidRef = null;

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

    // ── Background ────────────────────────────────────────────────────────────
    if (settings.bgImageUrl && settings.bgImageUrl.trim().length > 0) {
      try {
        // PptxGenJS can use a URL directly for backgrounds
        slide.background = { path: settings.bgImageUrl.trim() };
      } catch {
        // Fallback to color if the URL fails
        slide.background = { color: sanitizeHex(settings.bgColor) };
      }
    } else {
      slide.background = { color: sanitizeHex(settings.bgColor) };
    }

    // ── Text Configuration ────────────────────────────────────────────────────
    const isTop = settings.layout === 'top';
    const verticalAlign = isTop ? 'top' : 'middle';
    const padding = 0.5; // inches of padding from slide edges

    slide.addText(
      [
        // Verse body
        {
          text: verseText,
          options: {
            fontSize,
            fontFace: settings.fontFamily,
            color: sanitizeHex(settings.fontColor),
            bold: false,
            italic: false,
            breakLine: true,
          },
        },
        // Empty line spacer
        {
          text: '',
          options: { breakLine: true },
        },
        // Verse reference — slightly smaller, italic
        {
          text: `— ${verseRef}`,
          options: {
            fontSize: Math.max(14, fontSize * 0.65),
            fontFace: settings.fontFamily,
            color: sanitizeHex(settings.fontColor),
            italic: true,
            bold: false,
          },
        },
      ],
      {
        // Position: full slide minus padding
        x: padding,
        y: padding,
        w: 13.33 - padding * 2,
        h: 7.5 - padding * 2,
        valign: verticalAlign,
        align: 'center',
        wrap: true,
      }
    );
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const fallbackRef = 'KJV_Slides';
  const baseName = firstValidRef 
    ? firstValidRef.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
    : fallbackRef;

  const dateStr = new Date().toISOString().split('T')[0]; // e.g. 2026-03-16
  
  await pres.writeFile({ fileName: `${baseName}_KJV_${dateStr}.pptx` });
}
