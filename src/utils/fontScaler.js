/**
 * fontScaler.js
 * Calculates dynamic font size based on verse character count.
 * Also provides a warning if the text is likely to overflow a slide.
 */

/**
 * @typedef {Object} FontScaleResult
 * @property {number} fontSize - Font size in points for PptxGenJS
 * @property {boolean} overflow - Whether the text may overflow the slide
 * @property {string} sizeLabel - Human-readable size label for the UI
 */

/**
 * Returns the optimal font size for a given verse string length.
 * Thresholds are tuned for a standard 10" x 7.5" PowerPoint slide
 * with ~5% margin padding on each side.
 *
 * @param {string} text - The full verse text (including reference)
 * @returns {FontScaleResult}
 */
export function getScaledFont(text = '') {
  const len = text.length;

  if (len < 100) {
    return { fontSize: 48, overflow: false, sizeLabel: 'Extra Large (48pt)' };
  } else if (len < 200) {
    return { fontSize: 36, overflow: false, sizeLabel: 'Large (36pt)' };
  } else if (len <= 350) {
    return { fontSize: 28, overflow: false, sizeLabel: 'Medium (28pt)' };
  } else {
    return { fontSize: 20, overflow: true, sizeLabel: 'Small (20pt)' };
  }
}

/**
 * Maps pt font sizes to approximate CSS px/rem values for the live preview.
 * Assumes a 960×540px preview card (simulating a 10"×7.5" slide at 96dpi scaled).
 *
 * @param {number} ptSize - Font size in points
 * @param {number} previewWidthPx - Width of preview card in pixels
 * @returns {number} CSS font size in pixels for the preview
 */
export function ptToCssPreviewPx(ptSize, previewWidthPx = 960) {
  // 10" slide → previewWidthPx, so 1 inch = previewWidthPx/10 px
  // 1 pt = 1/72 inch
  const pxPerPt = previewWidthPx / 10 / 72;
  return ptSize * pxPerPt;
}
