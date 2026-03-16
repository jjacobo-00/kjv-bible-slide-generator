# 📖 KJV Bible Slide Generator

A modern, high-performance web application designed to generate professional KJV Bible presentation slides. Built for speed, offline reliability, and beautiful aesthetics.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## ✨ Features

*   🚀 **PowerPoint Export**: Generate and download structured `.pptx` files compatible with Microsoft PowerPoint and Google Slides.
*   💾 **Full Offline Engine**: Downloads and parses a local 4.5MB KJV JSON file on first load. No API dependency or usage limits.
*   🔍 **Intelligent Autocomplete**: Deeply integrated scripture reference lookup (Books, Chapters, and Verses).
*   🎨 **Custom Styles**: Global controls for Background Color/Images, Typography, and Layout that apply seamlessly across all slides.
*   📱 **Live Preview**: Real-time rendering of your slides exactly as they will appear in the export.
*   ➕ **Multi-Slide Support**: Create and manage multiple slides in a single session.

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

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 Usage

1.  **Search**: Type a book name (e.g., "John") to see autocomplete suggestions.
2.  **Select**: Click a suggestion or type the full reference (e.g., "John 3:16").
3.  **Customize**: Use the sidebar to change colors, fonts, and layout.
4.  **Manage**: Add or remove slides using the "+" and "trash" icons.
5.  **Export**: Click **Download PPTX** to save your presentation.

---

## 📄 License

This project is licensed under the MIT License.

---

Developed for Christian Baptist Tabernacle.
<!-- Updated: 2026-03-16 -->