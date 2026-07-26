# 🏆 Kids Challenge Game

An interactive, live multi-team trivia and minigame web application designed for fun, engaging classroom or family competitions!

---

## 🌟 Features

* **3-Team Support:** Customize team names, choose fun emojis (Lions, Eagles, Sharks, etc.), and pick custom brand colors.
* **10 Interactive Minigames:** Teams must complete a quick minigame before unlocking their question. Includes:
1. 🎈 **Balloon Pop**
2. 🃏 **Memory Cards**
3. ➕ **Math Puzzle**
4. 🟩 **Find the Green Color**
5. ⭐ **Catch the Star**
6. 🔢 **Sort Numbers (1 to 5)**
7. 🍓 **Find the Odd Emoji**
8. 🔵 **Pop Blue Bubbles**
9. 🍌 **Feed the Monkey (Fast Tap)**
10. 🔤 **Spell Word (C-A-T)**


* **Audio-Based Questions:** Integrated audio player supporting MP3/WAV voice notes with custom multiple-choice options and difficulty-based points (5, 10, 20 pts).
* **Question Anti-Repeat System:** Randomly selects questions without immediate repetition.
* **Victory Podium & Celebration:** A dramatic Game Over screen featuring a 3-place podium (Gold, Silver, Bronze) with dynamic confetti animations.
* **Seamless File-Based Sync (Phone ⇄ Laptop):** Add questions effortlessly on your smartphone, download a compact backup JSON file, and import it instantly to your laptop with zero data size limits.

---

## 📁 Project Structure

Make sure all files are in the same directory:

* `index.html` — Main welcome page and team setup screen.
* `style.css` — Global styles and animations.
* `game.html` — The core live gameplay screen.
* `game.css` — Styles for the game board and feedback overlays.
* `game.js` — Core game engine, turn management, and scoring logic.
* `miniGames.js` — Implementation of all 10 interactive minigames.
* `admin.html` — Admin dashboard to create questions and sync data.
* `admin.css` — Admin panel styling.
* `admin.js` — Question management and backup export/import logic.
* `storage.js` — LocalStorage wrapper and asset base64 encoder.

---

## 🚀 How to Run

1. Clone or download all project files into a single local folder.
2. Open `index.html` directly in any modern web browser.
3. Head over to the **Admin Panel** to create your first questions and audio files.
4. Customize your teams and click **START GAME**!

---

## 🔄 How to Sync Questions (Phone to Laptop)

Because audio files can be large, the app uses a clean file-sharing mechanism:

1. Open the **Admin Panel** on your **phone**.
2. Add your questions and audio.
3. Scroll down to the **Sync Section** and click **📥 Download Backup File**.
4. Transfer the `.json` file to your **laptop** (via WhatsApp, Telegram, or Email).
5. On your **laptop's Admin Panel**, select the file under the import section and click **📤 Upload & Import File**.
