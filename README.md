# ABX-TERMINAL v1.2 /// SYSTEM ONLINE

> **Engineered & Developed by Abdullah Iqbal**
> *CS Major @ FAST-NU | Aspiring Computer Scientist*

![Status](https://img.shields.io/badge/Status-Operational-cyan) ![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blueviolet) ![Platform](https://img.shields.io/badge/Platform-Windows-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**ABX-Terminal** is a hyper-advanced, AI-integrated shell environment designed to evolve the Windows command prompt into a **Holographic Command Deck**. It combines raw shell power with Context-Aware AI, Real-Time Hardware Telemetry, and a "God Mode" system control layer, all wrapped in a living **Hyper-Glass Aurora** interface.

---

## 🚀 Key Features

### 💎 The "Hyper-Glass" Interface
* **Aurora Engine:** Features a living, breathing deep-space radial gradient background.
* **Holographic Widgets:** Glass-morphism sidebar with **Real-Time CPU & RAM Telemetry** and Network Status.
* **CRT Immersion:** Subtle scanline overlays and text glowing effects for a tactical sci-fi feel.
* **Smart Word Wrapping:** Intelligent text rendering ensures long AI responses are formatted perfectly.

### 🧠 Advanced Intelligence
* **Context-Aware AI:** The terminal can "read." If you mention a file (e.g., *"Explain code.js"*), the system automatically reads the file and injects its content into the AI's context.
* **Voice Activation:** Features **Neural Text-to-Speech** (Google/Microsoft Natural). The terminal speaks responses aloud while typing them.
* **Google Gemini 2.5:** Integrated with the latest Gemini models for high-speed reasoning and code generation.

### ⚡ "God Mode" System Control
* **Omni-Launcher:** Bypass the Start Menu. Instantly launch apps, websites, or tools directly from the command line.
* **Web Uplink:** Type `search <query>` to instantly open a Google search in your default browser.
* **Protocol Overrides:** Commands like `launch spotify` or `code` execute immediately, bypassing the AI for zero-latency control.

### 🔊 Hi-Fi Procedural Audio
* **Synthesized Sound Engine:** No audio files used. The terminal generates **High-Fidelity sounds** in real-time using the Web Audio API.
    * *Typing:* Deep, lubricated mechanical switch "thock".
    * *Startup:* Cinematic synthesizer swell.
    * *Shutdown:* Clean, pure-sine power-down drop.

---

## 📥 Download & Usage

**1. Download the App**
Go to the [Releases](https://github.com/abdullahiqbal2610/abx-terminal/releases) section and download the latest `ABX-Terminal-v1.2.zip` file.

**2. Extract Files**
Unzip the folder to your Desktop or preferred location.

**3. Activate the AI Core**
To keep your data secure, the app requires your own Google Gemini API Key.
1.  Open the unzipped folder.
2.  Create a new text file named `.env`.
3.  Paste your key:
    ```env
    GEMINI_API_KEY=AIzaSy...YourKeyHere...
    ```
    *(Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

**4. Launch**
Run `abx_terminal.exe`. The system will initiate the boot sequence, verify identity, and engage the Neural Link.

---

## 📸 Command Cheat Sheet

### 🛡️ God Mode (System Control)
| Command | Action |
| --- | --- |
| `launch <app>` | Launches any app (e.g., `launch spotify`, `launch notepad`) |
| `search <query>` | Google searches the query in your browser |
| `open <url>` | Opens a specific website (e.g., `open youtube.com`) |
| `code` | Opens VS Code in the current directory |
| `files` | Opens the current folder in Windows Explorer |
| `calc` | Opens the Calculator |

### 🧠 AI & File Operations
| Command | Action |
| --- | --- |
| `explain test.txt` | Reads `test.txt`, sends content to AI, and explains it |
| `create a folder named X` | AI generates/runs `New-Item -ItemType Directory` |
| `delete all log files` | AI generates/runs recursive delete commands |
| `who are you` | AI responds verbally and via text |

### ⚙️ System
| Command | Action |
| --- | --- |
| `cls` / `clear` | Wipes screen, plays welcome sound, and re-prints banner |
| `exit` / `bye` | Plays "Power Down" sound animation and closes app |
| `ESC` Key | Instant Emergency Close |

---

## 🔧 Tech Stack

* **Core:** Electron.js, Node.js
* **System Access:** `child_process` (Exec), `os` (Telemetry), `fs` (File Reading)
* **Audio Engine:** Web Audio API (Procedural Synthesis)
* **Terminal Engine:** xterm.js + `addon-fit`
* **AI Backend:** Google Gemini API
* **Styling:** CSS3 (Animations, Gradients, Glassmorphism)

---

> *This software is a personal portfolio project demonstrating proficiency in System Design, AI Integration, and UI/UX Engineering.*
