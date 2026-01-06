const { ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");
const { FitAddon } = require("@xterm/addon-fit");
const path = require("path");

// Safe Import Logic
let askGemini;
try {
  askGemini = require(path.join(__dirname, "src", "gemini.js")).askGemini;
} catch (e) {
  try {
    askGemini = require(path.join(__dirname, "gemini.js")).askGemini;
  } catch (e2) {
    console.error("CRITICAL: Could not find gemini.js");
  }
}

// 1. SETUP TERMINAL
const term = new Terminal({
  cursorBlink: true,
  fontFamily: '"Cascadia Code", Consolas, monospace',
  fontSize: 14,
  theme: {
    background: "#00000000",
    foreground: "#e0e0e0",
    cursor: "#a855f7",
    selectionBackground: "rgba(168, 85, 247, 0.3)",
  },
  allowTransparency: true,
  rows: 40,
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const container = document.getElementById("terminal-container");
term.open(container);

setTimeout(() => {
  fitAddon.fit();
  term.writeln("\x1b[1;35m ABX-TERMINAL /// SYSTEM ONLINE \x1b[0m");
  term.writeln(" Connected to Local Shell.\r\n");
}, 100);

// 2. LISTEN FOR OUTPUT
ipcRenderer.on("terminal-incoming", (event, data) => {
  term.write(data);
});

// 3. HANDLE INPUT (AUTO-MAGIC MODE)
const inputField = document.getElementById("commandInput");

inputField.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const rawCommand = inputField.value.trim();
    inputField.value = "";

    // Visual Echo
    term.writeln("\r\n\x1b[1;32m❯ " + rawCommand + "\x1b[0m");

    // === SMART DETECTION LOGIC ===
    // We trigger AI if:
    // 1. Starts with "." (Explicit)
    // 2. Starts with "how", "what", "who", "create", "make" (Implicit)

    const aiTriggers = [
      "how",
      "what",
      "who",
      "why",
      "create",
      "make",
      "generate",
      "write",
    ];
    const firstWord = rawCommand.split(" ")[0].toLowerCase();

    const isExplicitAI = rawCommand.startsWith(".");
    const isImplicitAI = aiTriggers.includes(firstWord);

    // ... inside the inputField event listener ...

    if (isExplicitAI || isImplicitAI) {
      term.writeln("\x1b[35m [AI] Processing...\x1b[0m");

      const instruction = isExplicitAI ? rawCommand.substring(1) : rawCommand;
      const aiResponse = await askGemini(instruction);

      // === NEW LOGIC START ===
      if (aiResponse.startsWith("AI:")) {
        // CASE 1: It's just a chat answer (e.g. "AI: Paris")
        // Just print it nicely in Cyan, DO NOT execute it.
        term.writeln("\r\n\x1b[1;36m" + aiResponse + "\x1b[0m\r\n");
      } else {
        // CASE 2: It's a command (e.g. "New-Item...")
        // Print it in Purple and EXECUTE it.
        term.writeln("\x1b[35m [AI] Executing: " + aiResponse + "\x1b[0m");
        ipcRenderer.send("terminal-keystroke", aiResponse + "\r\n");
      }
      // === NEW LOGIC END ===
    } else {
      // Normal Windows Command
      ipcRenderer.send("terminal-keystroke", rawCommand + "\r\n");
    }
  }
});

window.addEventListener("resize", () => fitAddon.fit());

// Keep your Starfield function at the bottom...
function createStars() {
  const starContainer = document.getElementById("starsContainer");
  if (!starContainer) return;
  const starCount = 90;
  starContainer.innerHTML = "";
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 4 + "s";
    star.style.animationDuration = Math.random() * 3 + 3 + "s";
    const size = Math.random() * 1.5 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    starContainer.appendChild(star);
  }
}
createStars();
