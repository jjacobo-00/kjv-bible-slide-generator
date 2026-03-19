/**
 * bibleApi.js
 * Utility for loading and querying a local JSON KJV Bible (`public/kjv.json`).
 * Format: [{ name: "Genesis", abbrev: "gn", chapters: [ ["verse1", "verse2..."], ... ] }, ...]
 */

let bibleData = null;

/**
 * Loads the local JSON once and caches it in memory.
 */
async function loadBibleData() {
  if (bibleData) return bibleData;
  const res = await fetch('/kjv.json');
  if (!res.ok) throw new Error('Failed to load local bible data');
  bibleData = await res.json();
  return bibleData;
}

/**
 * Parses queries like "John 3:16", "1 John 1:9", "Genesis 1:1-5"
 */
function parseQuery(query) {
  // Regex to match "1 John", "John", "Song of Solomon" and chapter/verses
  // Group 1: Book name (can contain spaces and numbers)
  // Group 2: Chapter number
  // Group 3: Start verse
  // Group 4: End verse (optional)
  const match = query.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*-\s*(\d+))?$/);
  return match;
}

/**
 * Fetches a verse or range of verses from the local JSON.
 */
export async function fetchBibleVerse(query) {
  if (!query || !query.trim()) throw new Error('Query is required');
  const data = await loadBibleData();
  
  const match = parseQuery(query);
  if (!match) {
    throw new Error('Invalid query format. Use "Book Chapter:Verse" (e.g. John 3:16 or 1 John 1:9-10)');
  }
  
  const bookQuery = match[1].toLowerCase().trim();
  const chapterNum = parseInt(match[2], 10);
  const startVerse = parseInt(match[3], 10);
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;
  
  // Find book
  const book = data.find(b => b.name.toLowerCase() === bookQuery || b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === bookQuery.replace(/[^a-z0-9]/g, ''));
  
  if (!book) throw new Error(`Book not found matching "${match[1]}". Check spelling.`);
  if (chapterNum < 1 || chapterNum > book.chapters.length) {
    throw new Error(`${book.name} only has ${book.chapters.length} chapters.`);
  }
  
  const chapterIndex = chapterNum - 1;
  const chapter = book.chapters[chapterIndex];
  
  if (startVerse < 1 || startVerse > chapter.length) {
    throw new Error(`${book.name} ${chapterNum} only has ${chapter.length} verses.`);
  }
  const endV = Math.min(endVerse, chapter.length);
  
  if (startVerse > endV) throw new Error('Invalid verse range.');
  
  let results = [];
  for (let i = startVerse - 1; i < endV; i++) {
    // The JSON contains brackets for words added by translators, e.g. "{was}".
    // It also contains marginal notes, e.g. "{mantle: or, robe}". 
    // We want to keep plain added words but drop ones containing colons.
    let cleanedText = chapter[i]
      .replace(/\{([^}]+)\}/g, (match, contents) => contents.includes(':') ? '' : contents)
      .replace(/\s+/g, ' ')
      .trim();

    const currentVerseNum = i + 1;
    const ref = `${book.name} ${chapterNum}:${currentVerseNum}`;
    
    results.push({
      verseText: cleanedText,
      verseRef: ref
    });
  }
  
  return results; // Return the array of verse objects
}

/**
 * Provides autocomplete suggestions based on the user's current input string.
 */
export async function getAutocompleteSuggestions(query) {
  const data = await loadBibleData();
  const rawQ = query.trimStart();
  if (!rawQ) return [];

  // Parse logic: 
  // 1. Check for Book [Space] Chapter : Verse
  // We'll split by the last colon if it exists, then the last space before that digits.
  
  let bookStr = rawQ;
  let chapStr = "";
  let verseStr = "";

  const colonIndex = rawQ.lastIndexOf(':');
  if (colonIndex !== -1) {
    const preColon = rawQ.substring(0, colonIndex);
    verseStr = rawQ.substring(colonIndex + 1);
    
    const lastSpaceBeforeColon = preColon.lastIndexOf(' ');
    if (lastSpaceBeforeColon !== -1) {
      bookStr = preColon.substring(0, lastSpaceBeforeColon);
      chapStr = preColon.substring(lastSpaceBeforeColon + 1);
    }
  } else {
    // No colon, check for space + digits for chapter
    const lastSpace = rawQ.lastIndexOf(' ');
    if (lastSpace !== -1) {
      const potentiallyChap = rawQ.substring(lastSpace + 1);
      if (/^\d*$/.test(potentiallyChap)) {
        bookStr = rawQ.substring(0, lastSpace);
        chapStr = potentiallyChap;
      }
    }
  }

  const bookTerm = bookStr.trim().toLowerCase();
  
  // 1. Find potential books
  const candidates = data.filter(b => 
    b.name.toLowerCase().startsWith(bookTerm) || 
    b.abbrev.toLowerCase() === bookTerm
  );

  if (candidates.length === 0) return [];

  const exactBook = candidates.find(b => b.name.toLowerCase() === bookTerm);
  let suggestions = [];

  if (exactBook && (chapStr || rawQ.endsWith(' ') || colonIndex !== -1)) {
    const totalChapters = exactBook.chapters.length;
    
    if (colonIndex !== -1) {
      // Suggesting Verses
      const chapNum = parseInt(chapStr, 10);
      if (chapNum >= 1 && chapNum <= totalChapters) {
        const chapter = exactBook.chapters[chapNum - 1];
        const vPartNum = verseStr ? parseInt(verseStr, 10) : 1;
        
        for (let v = vPartNum; v <= Math.min(vPartNum + 4, chapter.length); v++) {
          suggestions.push(`${exactBook.name} ${chapNum}:${v}`);
        }
        if (!verseStr || verseStr === '1') {
           suggestions.push(`${exactBook.name} ${chapNum}:1-${chapter.length}`);
        }
      }
    } else {
      // Suggesting Chapters
      if (!chapStr) {
        // Just started space after book, suggest chapter 1
        suggestions.push(`${exactBook.name} 1:`);
      } else {
        const cNum = parseInt(chapStr, 10);
        for (let c = 1; c <= totalChapters; c++) {
          if (c.toString().startsWith(chapStr)) {
            suggestions.push(`${exactBook.name} ${c}:`);
            if (suggestions.length >= 8) break;
          }
        }
      }
    }
  } else {
    // Typing the book
    candidates.forEach(b => {
      suggestions.push(b.name + ' ');
    });
  }

  return Array.from(new Set(suggestions)).slice(0, 8);
}
