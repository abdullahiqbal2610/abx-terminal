const { ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");
const { FitAddon } = require("@xterm/addon-fit");
const path = require("path");

// Safe Import Logic for AI
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

// === REUSABLE WELCOME FUNCTION (Fixes CLS Crash) ===
function showWelcomeMessage() {
  term.writeln("\x1b[1;35m ABX-TERMINAL v1.0 /// SYSTEM ONLINE \x1b[0m");
  term.writeln(" ------------------------------------------------");
  term.writeln(" User Identity Verified: \x1b[1;36mM.Abdullah Iqbal\x1b[0m");
  term.writeln(
    " Role: \x1b[32mCS Junior @ FAST-NU\x1b[0m | \x1b[32mAspiring Data Scientist\x1b[0m"
  );
  term.writeln(" ------------------------------------------------");
  term.writeln(" \x1b[90m> Neural Link... \x1b[32mActive\x1b[0m");
  term.writeln(" \x1b[90m> Gemini 2.5...  \x1b[32mConnected\x1b[0m");

  // === THE SIGNATURE ===
  term.writeln(
    "\r\n \x1b[3m\x1b[90mEngineered & Developed by M.Abdullah Iqbal\x1b[0m"
  );
  term.writeln("\r\n Ready for input, Commander.\r\n");
}

// Initial Bootup
setTimeout(() => {
  fitAddon.fit();
  showWelcomeMessage(); // Call the function here
}, 100);

// 2. LISTEN FOR OUTPUT
ipcRenderer.on("terminal-incoming", (event, data) => {
  term.write(data);
});

// === 3. COMMAND HISTORY & INPUT HANDLING ===
const inputField = document.getElementById("commandInput");
let commandHistory = [];
let historyIndex = -1;

inputField.addEventListener("keydown", async (e) => {
  // --- FEATURE: COMMAND HISTORY (UP/DOWN) ---
  if (e.key === "ArrowUp") {
    if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
      historyIndex++;
      inputField.value =
        commandHistory[commandHistory.length - 1 - historyIndex];
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (historyIndex > 0) {
      historyIndex--;
      inputField.value =
        commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      inputField.value = "";
    }
  }

  // --- FEATURE: EXECUTE COMMAND (ENTER) ---
  else if (e.key === "Enter") {
    const rawCommand = inputField.value.trim();
    if (!rawCommand) return;

    // Save to History
    commandHistory.push(rawCommand);
    historyIndex = -1;
    inputField.value = "";

    // Handle Close Commands
    const closeCommands = ["exit", "quit", "bye", "over n out"];
    if (closeCommands.includes(rawCommand.toLowerCase())) {
      term.writeln("\x1b[31m Shutting down systems...\x1b[0m");
      setTimeout(() => {
        ipcRenderer.send("app-close");
      }, 800); // Small delay for dramatic effect
      return;
    }

    // --- FEATURE: CLS (SMART CLEAR) ---
    if (
      rawCommand.toLowerCase() === "cls" ||
      rawCommand.toLowerCase() === "clear"
    ) {
      term.clear(); // Wipe the mess
      ipcRenderer.send("terminal-keystroke", "cls\r\n"); // Reset PowerShell

      // RE-PRINT HEADER (Now this works because function exists!)
      setTimeout(() => {
        showWelcomeMessage();
      }, 50);
      return;
    }

    // Echo Command
    term.writeln("\r\n\x1b[1;32m❯ " + rawCommand + "\x1b[0m");

    // === SMART DETECTION LOGIC ===
    // === SMART DETECTION LOGIC ===
    const aiTriggers = [
      // 1. QUESTIONS & INFO
      "how",
      "what",
      "who",
      "why",
      "where",
      "when",
      "which",
      "explain",
      "define",
      "describe",
      "summarize",
      "list",
      "show",
      "check",
      "find",
      "search",
      "locate",
      "get",
      "calculate",
      "count",

      // 2. CREATION & GENERATION
      "create",
      "make",
      "generate",
      "write",
      "build",
      "construct",
      "init",
      "initialize",
      "new",
      "add",
      "insert",
      "setup",

      // 3. MODIFICATION & EDITING
      "update",
      "change",
      "modify",
      "edit",
      "convert",
      "transform",
      "rename",
      "replace",
      "append",
      "prepend",
      "fix",
      "debug",
      "optimize",
      "refactor",
      "clean",
      "format",

      // 4. FILE & SYSTEM ACTIONS
      "remove",
      "delete",
      "del",
      "erase",
      "kill",
      "destroy",
      "wipe",
      "move",
      "mv",
      "transfer",
      "copy",
      "cp",
      "duplicate",
      "clone",
      "open",
      "launch",
      "run",
      "start",
      "execute",
      "install",
      "uninstall",
      "download",
      "fetch",

      // 5. CONVERSATION & POLITE REQUESTS
      "hello",
      "hi",
      "hey",
      "greetings",
      "good",
      "yo",
      "please",
      "can",
      "could",
      "would",
      "do",
      "does",
      "is",
      "are",
    ];

    const firstWord = rawCommand.split(" ")[0].toLowerCase();
    const isExplicitAI = rawCommand.startsWith(".");
    const isImplicitAI = aiTriggers.includes(firstWord);

    if (isExplicitAI || isImplicitAI) {
      term.writeln("\x1b[35m [AI] Processing...\x1b[0m");

      const instruction = isExplicitAI ? rawCommand.substring(1) : rawCommand;
      const aiResponse = await askGemini(instruction);

      // === SMARTER EXECUTION LOGIC ===
      // 1. Check if it's explicitly marked as Chat
      if (aiResponse.startsWith("AI:")) {
        term.writeln("\r\n\x1b[1;36m" + aiResponse + "\x1b[0m\r\n");
      }
      // 2. Safety Check (Catch-all for chat)
      else if (
        !aiResponse.includes("-") &&
        !aiResponse.includes("Get") &&
        !aiResponse.includes("New") &&
        !aiResponse.includes("Set") &&
        !aiResponse.includes("Remove") &&
        !aiResponse.includes("Move")
      ) {
        term.writeln("\r\n\x1b[1;36m AI: " + aiResponse + "\x1b[0m\r\n");
      }
      // 3. Otherwise, Execute
      else {
        term.writeln("\x1b[35m [AI] Executing: " + aiResponse + "\x1b[0m");
        ipcRenderer.send("terminal-keystroke", aiResponse + "\r\n");
      }
    } else {
      ipcRenderer.send("terminal-keystroke", rawCommand + "\r\n");
    }
  }
});

// --- FEATURE: ESCAPE TO CLOSE ---
document.addEventListener("keydown", (e) => {
  // If user hits ESC, close the app
  if (e.key === "Escape") {
    ipcRenderer.send("app-close");
  }
});

window.addEventListener("resize", () => fitAddon.fit());

// Starfield
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
