/**
 * imageUtils.js
 * Utility for fetching, compressing, and converting images to Data URIs.
 */

/**
 * Fetches an image and processes it through a canvas for compression.
 * Handles CORS and provides a high-quality (90-99%) JPEG Data URI.
 * 
 * @param {string} url - Image URL or Data URI
 * @param {number} quality - JPEG quality (0.0 to 1.0)
 * @returns {Promise<string>} - Cleaned Data URI
 */
export async function processImage(url, quality = 0.95, useProxy = false) {
  if (!url || url.trim() === '') return null;

  // If we've already tried and failed with a proxy, just stop to avoid loops
  const PROXY_URL = "https://api.allorigins.win/raw?url=";
  const targetUrl = useProxy ? `${PROXY_URL}${encodeURIComponent(url)}` : url;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set crossOrigin to anonymous to try fetching with CORS
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) {
        console.error('Canvas processing failed (likely CORS):', err);
        // If it's a CORS issue and we haven't tried the proxy yet, try it!
        if (!useProxy && !url.startsWith('data:')) {
          console.log('Attempting fetch with CORS proxy...');
          processImage(url, quality, true).then(resolve).catch(() => resolve(null));
        } else {
          resolve(null);
        }
      }
    };

    img.onerror = (err) => {
      console.error('Image loading failed:', targetUrl, err);
      // If it failed to load normally, try the proxy as a fallback
      if (!useProxy && !url.startsWith('data:')) {
        console.log('Initial load failed. Trying CORS proxy...');
        processImage(url, quality, true).then(resolve).catch(() => resolve(null));
      } else {
        resolve(null);
      }
    };

    img.src = targetUrl;
  });
}
