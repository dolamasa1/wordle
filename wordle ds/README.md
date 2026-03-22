# 🧪 Wordle Data Science (DS) Tools

This directory contains the tools used to curate and generate the `words.json` dictionary used by the Wordle game.

## 📁 Contents

- **`create_dictionary.py`**: Python script to process raw word lists into structured JSON.
- **`words.txt`**: Raw source list of words and their metadata.
- **`mini_dictionary.json`**: A smaller sample dictionary for testing.

## ⚙️ How it Works

The scripts here handle:
1. **Filtering**: Selecting 5-letter words suitable for the game.
2. **Translation**: Mapping words to their Arabic equivalents.
3. **Tiering**: Assigning CEFR levels (A1, B2, etc.) based on frequency data.
4. **Exporting**: Generating the final `words.json` used by the frontend.

## 🛠️ Requirements

To run the generation tools, you will need:
- Python 3.x
- Any necessary data sources (referenced within the script)
