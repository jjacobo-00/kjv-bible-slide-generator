# 📖 KJV Bible & Lyrics Slide Generator

A modern, high-performance web application designed to generate professional KJV Bible and Song Lyric presentation slides. Built for speed, offline reliability, and beautiful aesthetics.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## ✨ Features

### 📖 Bible Mode
*   💾 **Full Offline Engine**: Downloads and parses a local 4.5MB KJV JSON file on first load. No API dependency.
*   🔍 **Intelligent Autocomplete**: Deeply integrated scripture reference lookup for Books, Chapters, and Verses.
*   ➕ **Multi-Slide Management**: Create and manage multiple scripture slides in a single session.

### 🎵 Song Lyrics Mode
*   🪄 **Smart Parsing**: Automatically detects and filters out structural labels like `[Verse 1]`, `(Chorus)`, or `Bridge:`.
*   📏 **Dynamic Grouping**: Choose between **Standard (2 lines)** or **Compact (4 lines)** layouts per slide.
*   ⚖️ **Auto-Scaling Typography**: Intelligent font scaling ensures long lines always fit perfectly within the 16:9 frame.

### 🛠️ Core Capabilities
*   🚀 **PowerPoint Export**: Generate structured `.pptx` files with distinct naming conventions for Bible vs. Lyrics.
*   🎨 **Rich Design System**: Global controls for Background Color/Images, Premium Typography (Montserrat, Inter, Playfair), and Layout.
*   📱 **Live Preview**: Real-time rendering mirrors exactly how the export will look.

---

## 🛠️ Tech Stack

*   **Framework**: [React 19](https://react.dev/)
*   **Bundler**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **PPTX Engine**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
*   **Hosting**: Optimized for [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (Latest LTS recommended)
*   npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jjacobo-00/kjv-bible-slide-generator.git
   cd kjv-bible-slide-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

---

## 📖 Usage

1.  **Switch Modes**: Use the toggle in the sidebar to switch between **Bible** and **Lyrics**.
2.  **Input Content**:
    *   **Bible**: Type a reference (e.g., "John 3:16") and click Fetch.
    *   **Lyrics**: Paste raw lyrics; structural noise is automatically filtered.
3.  **Customize**: Choose your layout (Standard/Compact for lyrics, Top/Center for Bible) and background.
4.  **Export**: Click **Download PPTX** to save your presentation locally.

---

## 📄 License

This project is licensed under the MIT License.

---

Developed for Christian Baptist Tabernacle.
<!-- Updated: 2026-03-16 -->