
# ABX-TERMINAL /// SYSTEM ONLINE

> **Engineered & Developed by Abdullah Iqbal**
> *CS Junior @ FAST-NU | Aspiring Data Scientist*

![Status](https://img.shields.io/badge/Status-Operational-success) ![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blueviolet) ![Platform](https://img.shields.io/badge/Platform-Windows-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**ABX-Terminal** is a futuristic, transparent, AI-integrated shell environment designed to replace the standard Windows command prompt. It bridges the gap between raw shell power and modern AI assistance, allowing users to execute complex system operations using natural language.

---

## 🚀 Key Features

* **🧠 AI-Powered Core:** Integrated with **Google Gemini 1.5 Flash**. Ask questions (*"What is the capital of Pakistan?"*) or request actions (*"Create a folder named Project_X"*) in plain English.
* **🗣️ Voice Activation:** Features **Neural Text-to-Speech** integration. The terminal speaks AI responses aloud ("J.A.R.V.I.S. style") while keeping standard system operations silent.
* **🎬 Cinematic Boot:** Initiates with a retro-futuristic typewriter animation and "CRT Power-On" effect.
* **📍 Smart Workspace:** Automatically navigates to the **Desktop** directory on startup for instant workflow readiness.
* **💎 Glassmorphism UI:** Fully transparent, borderless window with a dynamic starfield background and neon accents.
* **🛡️ Security Protocols:** Filters dangerous commands and provides "Smart Clear" (`cls`) functionality that preserves system identity headers.
* **📦 Portable Architecture:** Built with Electron, capable of running as a standalone `.exe` without dependencies.

---

## 📥 Download & Usage (For Users)

**1. Download the App**
Go to the [Releases](https://github.com/abdullahiqbal2610/abx-terminal/releases) section and download the latest `ABX-Terminal-v1.1.zip` file.

**2. Extract Files**
Unzip the folder to your Desktop or preferred location.

**3. Activate the AI Core (Important!)**
To keep your data secure, the app requires your own Google Gemini API Key.
1.  Open the unzipped folder.
2.  Create a new text file named `.env` (remove `.txt` extension if present).
3.  Open it with Notepad and paste your key like this:
    ```env
    GEMINI_API_KEY=AIzaSy...YourKeyHere...
    ```
    *(Don't have a key? Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey))*

**4. Launch**
Run `abx_terminal.exe`. The system will verify your identity, speak the connection status, and come online.

---

## 🛠️ Developer Setup (Build from Source)

If you want to modify the code or build it yourself:

### 1. Clone the Repository
```bash
git clone [https://github.com/abdullahiqbal2610/abx-terminal.git](https://github.com/abdullahiqbal2610/abx-terminal.git)
cd abx-terminal

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=Your_Google_Gemini_Key

```

### 4. Launch System

```bash
npm start

```

### 5. Build Standalone (.exe)

To compile the project into a portable executable:

```bash
npm run make

```

*Artifacts will be generated in the `out/` directory.*

---

## 📸 Command Cheat Sheet

| Command | Action |
| --- | --- |
| `dir` / `ls` | Lists files (Standard PowerShell) |
| `create a file named log.txt` | AI translates to `New-Item -Path "log.txt" -ItemType File -Force` |
| `remove the folder test` | AI translates to `Remove-Item -Path "test" -Recurse -Force` |
| `explain recursion` | AI answers verbally (Voice Output) and via text |
| `cls` / `clear` | Wipes screen and re-types the "Abdullah Iqbal" banner |
| `over n out` | Initiates cinematic shutdown sequence |
| `ESC` Key | Emergency instant close |

---

## 🔧 Tech Stack

* **Core:** Electron.js, Node.js
* **Shell Integration:** PowerShell (via `child_process` spawning)
* **Terminal Engine:** xterm.js (WebGL Accelerated)
* **AI Backend:** Google Gemini API
* **Voice Engine:** Web Speech API (Neural TTS)
* **Styling:** CSS3 (Keyframes, CRT Effects, Custom Scrollbars)

---

> *This software is a personal portfolio project demonstrating proficiency in System Design, AI Integration, and UI/UX Engineering.*

```

```
