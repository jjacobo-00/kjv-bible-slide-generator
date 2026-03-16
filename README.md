# KJV Bible Slide Generator

A modern, fast, and offline-capable web application for generating beautiful KJV Bible presentation slides. Built with React, Vite, Tailwind CSS, and PptxGenJS.

## ✨ Features

- **Multi-Slide Support**: Create as many slides as you need in a single presentation.
- **Full Offline Engine**: Downloads and parses a local 4.5MB KJV JSON file. No API dependency.
- **Intelligent Autocomplete**: Deeply integrated scripture reference lookup (Books, Chapters, and Verses).
- **Customizable Styling**: Global controls for Background Color/Image, Typography, and Layout that apply to all slides.
- **PowerPoint Export**: One-click download of a structured `.pptx` file compatible with Microsoft PowerPoint and Google Slides.
- **Secure & Fast**: No tracking, no backend, and extremely fast build times.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **PPTX Engine**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
- **Hosting Reference**: Optimized for [Vercel](https://vercel.com/) or Netlify.

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run in development mode**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## 📜 Usage

- Type a book name in the input (e.g., "John") to see the autocomplete dropdown.
- Select a book, type a chapter and verse (e.g., "3:16").
- Click **Fetch** to see the preview.
- Add more slides by clicking the **+ Add** button at the top of the sidebar.
- Customize the look in the sidebar.
- Click **Download PPTX** to save your work.

## 📄 License

MIT
