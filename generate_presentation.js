import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.title = "CBT KJV Bible & Lyrics Generator – Project Presentation";
pres.author = "Jacob Jacobo";
pres.layout = "LAYOUT_WIDE"; // 16:9

// =====================================================================
// COLOUR PALETTE & REUSABLE HELPERS
// =====================================================================
const NAVY   = "0D1B3E";   // slide backgrounds (dark)
const ACCENT = "4F9CF9";   // vivid blue accent
const GOLD   = "F5C842";   // warm highlight / callout
const WHITE  = "FFFFFF";
const LGRAY  = "D9E0EE";   // light text / subtitles
const MGRAY  = "8A96A8";   // muted label text
const CARD   = "162347";   // inner card background

// ── text helpers ──────────────────────────────────────────────────────
const T = (txt, opts = {}) => ({ text: txt, options: opts });

// thin coloured rule under a heading
function addRule(slide, y = 1.05) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y, w: 9, h: 0.045,
    fill: { color: ACCENT }, line: { color: ACCENT }
  });
}

// dark card / panel
function addCard(slide, x, y, w, h) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: CARD },
    shadow: { type: "outer", color: "000000", opacity: 0.4, blur: 8, offset: 4, angle: 270 },
    line: { color: ACCENT, pt: 1 }
  });
}

// rounded pill badge
function addPill(slide, label, x, y) {
  slide.addText(label, {
    x, y, w: 1.6, h: 0.32,
    fontSize: 10, bold: true, color: NAVY,
    fill: { color: ACCENT },
    align: "center", valign: "middle",
    rectRadius: 0.08
  });
}

// accent circle bullet point
function bulletRow(slide, icon, label, desc, x, y) {
  // icon circle
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.44, h: 0.44,
    fill: { color: ACCENT }, line: { color: ACCENT }
  });
  slide.addText(icon, {
    x, y, w: 0.44, h: 0.44,
    fontSize: 14, color: WHITE, align: "center", valign: "middle"
  });
  // label
  slide.addText(label, {
    x: x + 0.54, y, w: 3, h: 0.24,
    fontSize: 11, bold: true, color: WHITE
  });
  // desc
  slide.addText(desc, {
    x: x + 0.54, y: y + 0.23, w: 3.2, h: 0.3,
    fontSize: 9, color: LGRAY
  });
}

// =====================================================================
// SLIDE 1 — TITLE / HERO
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // large left accent bar
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: "100%",
    fill: { color: ACCENT }, line: { color: ACCENT }
  });

  // cross icon row
  s.addText("✝", {
    x: 0.4, y: 0.35, w: 0.8, h: 0.8,
    fontSize: 42, color: GOLD, align: "center"
  });
  s.addText("📖", {
    x: 1.1, y: 0.38, w: 0.8, h: 0.8,
    fontSize: 38, color: WHITE, align: "center"
  });

  // main title
  s.addText("KJV Bible & Lyrics\nSlide Generator", {
    x: 0.4, y: 1.2, w: 7.5, h: 1.8,
    fontSize: 50, bold: true, color: WHITE,
    lineSpacingMultiple: 1.15
  });

  // tag line
  s.addText("Making church presentations simple for everyone — no tech skills needed.", {
    x: 0.4, y: 2.95, w: 7.5, h: 0.6,
    fontSize: 18, color: LGRAY, italic: true
  });

  addRule(s, 3.72);

  // meta badges
  addPill(s, "React 19",  0.4,  3.9);
  addPill(s, "Vite",      2.1,  3.9);
  addPill(s, "PptxGenJS", 3.8,  3.9);
  addPill(s, "Vercel",    5.55, 3.9);

  s.addText("Developed for Christian Baptist Tabernacle  ·  March 2026", {
    x: 0.4, y: 4.65, w: 9, h: 0.35,
    fontSize: 11, color: MGRAY, align: "left"
  });
}

// =====================================================================
// SLIDE 2 — WHAT IS IT? (plain language)
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("What Does This App Do?", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);

  s.addText(
    "Have you ever had to manually type Bible verses or song lyrics into \nPowerPoint one slide at a time? That takes 30–60 minutes every Sunday.\n\n" +
    "This app cuts that down to under 60 seconds.",
    {
      x: 0.5, y: 1.2, w: 9, h: 1.5,
      fontSize: 17, color: LGRAY, lineSpacingMultiple: 1.4
    }
  );

  // three stat cards
  const cards = [
    { icon: "⏱️", stat: "< 60 sec", label: "Average time to create a full presentation" },
    { icon: "📴", stat: "100% Offline", label: "Bible data is stored in the app — no internet needed" },
    { icon: "🖨️", stat: ".pptx Export", label: "Download and open directly in PowerPoint or Google Slides" },
  ];

  cards.forEach((c, i) => {
    const x = 0.4 + i * 3.1;
    addCard(s, x, 2.85, 2.8, 1.6);
    s.addText(c.icon, { x, y: 2.88, w: 2.8, h: 0.55, fontSize: 28, align: "center" });
    s.addText(c.stat, { x, y: 3.38, w: 2.8, h: 0.45, fontSize: 20, bold: true, color: GOLD, align: "center" });
    s.addText(c.label, { x: x + 0.1, y: 3.82, w: 2.6, h: 0.5, fontSize: 10, color: LGRAY, align: "center" });
  });
}

// =====================================================================
// SLIDE 3 — HOW IT WORKS (step-by-step)
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("How Does It Work?", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);
  s.addText("It's as easy as 1–2–3!", {
    x: 0.5, y: 1.1, w: 9, h: 0.4,
    fontSize: 16, color: ACCENT, italic: true
  });

  const steps = [
    { num: "1", emoji: "🔍", title: "Pick a Mode", body: "Choose Bible mode to search scripture, or Lyrics mode to paste song text. Switch between them instantly." },
    { num: "2", emoji: "⚙️", title: "Customize", body: "Pick your background colour or image, font style, and text layout (top, center, bottom). A live preview updates as you go." },
    { num: "3", emoji: "💾", title: "Download", body: "Click 'Download PPTX'. Your file saves to your computer instantly — ready to open in PowerPoint." },
  ];

  steps.forEach((st, i) => {
    const x = 0.3 + i * 3.1;
    addCard(s, x, 1.65, 2.95, 2.8);

    // big step circle
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 1.05, y: 1.7, w: 0.82, h: 0.82,
      fill: { color: ACCENT }, line: { color: ACCENT }
    });
    s.addText(st.num, {
      x: x + 1.05, y: 1.7, w: 0.82, h: 0.82,
      fontSize: 26, bold: true, color: WHITE, align: "center", valign: "middle"
    });

    s.addText(st.emoji, { x, y: 2.55, w: 2.95, h: 0.55, fontSize: 28, align: "center" });
    s.addText(st.title, {
      x: x + 0.1, y: 3.08, w: 2.75, h: 0.4,
      fontSize: 15, bold: true, color: WHITE, align: "center"
    });
    s.addText(st.body, {
      x: x + 0.15, y: 3.5, w: 2.65, h: 0.9,
      fontSize: 10, color: LGRAY, align: "center", lineSpacingMultiple: 1.3
    });
  });
}

// =====================================================================
// SLIDE 4 — BIBLE MODE
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("📖  Bible Mode", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);

  // left side — description
  s.addText(
    "Type a scripture reference (like \"John 3:16\") and the app finds the verse instantly — no internet connection required.",
    { x: 0.5, y: 1.2, w: 4.4, h: 0.9, fontSize: 15, color: LGRAY, lineSpacingMultiple: 1.4 }
  );

  bulletRow(s, "📴", "Fully Offline",  "4.5 MB Bible database stored locally in the browser.", 0.5, 2.25);
  bulletRow(s, "⌨️", "Smart Search",  "Auto-suggests book names and chapter numbers as you type.", 0.5, 2.9);
  bulletRow(s, "🗂️", "Queue Multiple","Add many verses from different books — export them all at once.", 0.5, 3.55);
  bulletRow(s, "🔀", "Layout Choices","Position text at the Top, Center, or Bottom of each slide.", 0.5, 4.2);

  // right side — mock slide card
  addCard(s, 5.3, 1.15, 4.3, 3.55);
  s.addText("LIVE PREVIEW EXAMPLE", {
    x: 5.3, y: 1.2, w: 4.3, h: 0.35,
    fontSize: 9, color: MGRAY, align: "center", bold: true
  });
  s.addShape(pres.ShapeType.rect, {
    x: 5.5, y: 1.55, w: 3.9, h: 2.5,
    fill: { color: "111827" }, line: { color: MGRAY, pt: 1 }
  });
  s.addText(
    "\"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.\"\n\nJohn 3:16 (KJV)",
    {
      x: 5.55, y: 1.6, w: 3.8, h: 2.4,
      fontSize: 11, color: WHITE, align: "center", valign: "middle",
      lineSpacingMultiple: 1.5, italic: true
    }
  );
  s.addText("Reference shown automatically below verse", {
    x: 5.3, y: 4.1, w: 4.3, h: 0.4,
    fontSize: 9, color: MGRAY, align: "center"
  });
}

// =====================================================================
// SLIDE 5 — LYRICS MODE
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("🎵  Song Lyrics Mode", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);

  s.addText(
    "Paste a whole song — labels like '[Verse 1]' or '(Chorus)' are removed automatically. The app splits the lyrics into clean, readable slides.",
    { x: 0.5, y: 1.2, w: 9, h: 0.75, fontSize: 15, color: LGRAY, lineSpacingMultiple: 1.4 }
  );

  // before / after cards
  addCard(s, 0.4, 2.1, 4.1, 2.5);
  s.addText("📋  WHAT YOU PASTE", { x: 0.4, y: 2.15, w: 4.1, h: 0.35, fontSize: 10, color: MGRAY, bold: true, align: "center" });
  s.addText(
    "[Verse 1]\nAmazing grace how sweet the sound\nThat saved a wretch like me\n[Chorus]\nI once was lost but now am found",
    { x: 0.6, y: 2.55, w: 3.7, h: 1.8, fontSize: 11, color: LGRAY, lineSpacingMultiple: 1.5 }
  );

  // arrow
  s.addText("→", { x: 4.6, y: 3.0, w: 0.7, h: 0.6, fontSize: 28, color: ACCENT, align: "center" });

  addCard(s, 5.4, 2.1, 4.1, 2.5);
  s.addText("✅  WHAT YOU GET", { x: 5.4, y: 2.15, w: 4.1, h: 0.35, fontSize: 10, color: ACCENT, bold: true, align: "center" });
  s.addText(
    "Slide 1:\nAmazing grace how sweet the sound\nThat saved a wretch like me\n\nSlide 2:\nI once was lost but now am found",
    { x: 5.6, y: 2.55, w: 3.7, h: 1.8, fontSize: 11, color: WHITE, lineSpacingMultiple: 1.5 }
  );

  s.addText("📏  Choose 2 lines per slide (Standard) or 4 lines (Compact) — text always auto-scales to fit!", {
    x: 0.5, y: 4.75, w: 9, h: 0.4,
    fontSize: 12, color: GOLD, align: "center", italic: true
  });
}

// =====================================================================
// SLIDE 6 — CUSTOMIZATION & DESIGN
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("🎨  Customization Options", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);

  const features = [
    { icon: "🖼️", title: "Background",  body: "Solid colour or upload your own image. Changes apply to every slide instantly." },
    { icon: "🔤", title: "Fonts",        body: "Pick from premium typefaces: Inter, Montserrat, or Playfair Display." },
    { icon: "📐", title: "Layout",       body: "Position text at the Top, Centre, Bottom, or Left of the slide." },
    { icon: "🌗", title: "Contrast",     body: "Dark mode by default for projector clarity. Easy to switch to a bright theme." },
    { icon: "🔭", title: "Preview",      body: "Every change shows up live — no guessing what the final slide will look like." },
    { icon: "📤", title: "Export",       body: "One click downloads a proper .pptx file you can open on any computer." },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 3.1;
    const y = 1.35 + row * 1.75;
    addCard(s, x, y, 2.85, 1.55);
    s.addText(f.icon, { x, y: y + 0.08, w: 2.85, h: 0.5, fontSize: 24, align: "center" });
    s.addText(f.title, { x: x + 0.1, y: y + 0.55, w: 2.65, h: 0.3, fontSize: 12, bold: true, color: WHITE, align: "center" });
    s.addText(f.body,  { x: x + 0.1, y: y + 0.85, w: 2.65, h: 0.6, fontSize: 9,  color: LGRAY, align: "center", lineSpacingMultiple: 1.3 });
  });
}

// =====================================================================
// SLIDE 7 — TECH STACK (simplified)
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("🛠️  Under the Hood", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 34, bold: true, color: WHITE
  });
  addRule(s);
  s.addText("(For the curious — don't worry if these terms are unfamiliar!)", {
    x: 0.5, y: 1.1, w: 9, h: 0.4,
    fontSize: 13, color: MGRAY, italic: true
  });

  const tech = [
    { pill: "React 19",    desc: "The framework that powers the interactive user interface — like the engine of a car." },
    { pill: "Vite",        desc: "A super-fast build tool that makes the app load almost instantly in the browser." },
    { pill: "Tailwind 4",  desc: "A modern design system used to style every button, card, and menu in the app beautifully." },
    { pill: "PptxGenJS",   desc: "The library that actually builds the PowerPoint file right inside your web browser." },
    { pill: "Vercel",      desc: "The hosting service that puts the app online so anyone can access it for free via a link." },
  ];

  tech.forEach((t, i) => {
    const y = 1.65 + i * 0.65;
    addPill(s, t.pill, 0.5, y + 0.04);
    s.addText("–", { x: 2.2, y, w: 0.4, h: 0.6, fontSize: 16, color: MGRAY, align: "center", valign: "middle" });
    s.addText(t.desc, { x: 2.6, y, w: 6.8, h: 0.6, fontSize: 14, color: LGRAY, valign: "middle" });
    if (i < tech.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: 0.5, y: y + 0.62, w: 9, h: 0,
        line: { color: CARD, pt: 1 }
      });
    }
  });
}

// =====================================================================
// SLIDE 8 — CLOSING / THANK YOU
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // top accent strip
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.18,
    fill: { color: ACCENT }, line: { color: ACCENT }
  });

  s.addText("✝", { x: 0, y: 0.5, w: "100%", h: 1.0, fontSize: 60, color: GOLD, align: "center" });

  s.addText("Thank You", {
    x: 0, y: 1.5, w: "100%", h: 0.9,
    fontSize: 54, bold: true, color: WHITE, align: "center"
  });
  s.addText("Questions? Let's talk!", {
    x: 0, y: 2.4, w: "100%", h: 0.5,
    fontSize: 20, color: ACCENT, align: "center", italic: true
  });

  addRule(s, 3.1);

  s.addText(
    "Live Demo  ·  github.com/jjacobo-00/kjv-bible-slide-generator",
    { x: 0, y: 3.3, w: "100%", h: 0.45, fontSize: 13, color: LGRAY, align: "center" }
  );
  s.addText(
    "Developed for Christian Baptist Tabernacle  ·  March 2026",
    { x: 0, y: 4.6, w: "100%", h: 0.35, fontSize: 11, color: MGRAY, align: "center" }
  );

  // bottom strip
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.0, w: "100%", h: 0.18,
    fill: { color: ACCENT }, line: { color: ACCENT }
  });
}

// =====================================================================
// GENERATE FILE
// =====================================================================
pres.writeFile({ fileName: "Project_Presentation.pptx" })
  .then(f => { console.log(`✅  Created: ${f}`); process.exit(0); })
  .catch(e => { console.error(`❌  Error: ${e}`); process.exit(1); });
