# 🎮 Futuristic Wordle: MD System Edition

A sleek, self-contained implementation of the classic Wordle game, enhanced with bilingual (English/Arabic) definitions and linguistic frequency scoring.

## 🎯 Purpose

This project was built as an educational extension of the **MD System**. Its primary goal is to provide dentists and medical professionals with a fun, interactive way to expand their professional English vocabulary. By associating 5-letter words with their Arabic definitions and CEFR levels, it transforms a simple game into a powerful language-learning tool.

## 🛤️ The Journey

The development of this Wordle implementation followed a structured architectural path:

1.  **Initial Prototyping**: We began with rapid HTML/JS prototypes (saved in `legacy_versions/`) to validate the game's core loop and responsiveness.
2.  **Linguistic Engineering**: Using Python scripts (found in `wordle ds/`), we processed large-scale English datasets to curate a dictionary of 5-letter words, assigning them difficulty "tiers" (A1 through C2) and translating them for Arabic context.
3.  **Modern Refactoring**: The project was transitioned from a monolithic structure to a decentralized one, separating the 4MB dictionary (`words.json`) from the logic (`script.js`) to ensure optimal performance.
4.  **Futuristic UI/UX**: Finally, we applied a "Futuristic" glassmorphism design language, creating a premium experience that aligns with the MD System brand.

## ✨ Key Features

- **CEFR-Level Difficulty**: Choose from A1-A2 (Basic) up to C1-C2 (Advanced).
- **Bilingual Education**: Every guess provides instant access to English and Arabic definitions.
- **Linguistic Data**: View the frequency score of each word to understand its real-world usage.
- **Responsive PWA-Ready**: Fully functional on mobile and desktop with a custom virtual keyboard.

## 📁 Project Structure

This project is designed to be well-encapsulated:
- **`index.html`**: Entry point for the modern game.
- **`script.js`**: Game logic (PWA-ready).
- **`styles.css`**: Futuristic "Glass" theme.
- **`words.json`**: The compressed 4.2MB bilingual dictionary.
- **`wordle ds/`**: The "Core" dictionary generation toolset.
- **`legacy_versions/`**: Historical prototypes (v1, v2, v4).
- **`assets/`**: Localized resources for offline reliability.

## 🛠️ Getting Started

Open `index.html` via a local server (e.g., Live Server or Python `http.server`) to ensure the dictionary loads correctly via `fetch`.

## 🌐 Resources & Encapsulation

To maintain its aesthetic and functionality, this project focuses on minimal external dependencies:
- **Google Fonts (Poppins)**: Used for modern typography (localization pending in `assets/fonts`).
- **Font Awesome**: Referenced in the main site, but the Wordle tool uses unicode (⚙) locally to reduce overhead.
