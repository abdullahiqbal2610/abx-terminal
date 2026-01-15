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

// === FORCE HIDE SCROLLBAR (THE INJECTOR) ===
const style = document.createElement("style");
style.textContent = `
    ::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        background: transparent !important;
    }
    .xterm-viewport::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        background: transparent !important;
    }
`;
document.head.appendChild(style);
// ==========================================

// === TYPEWRITER HELPER ===
// Types text character-by-character.
// 'delay' is the speed in ms (Lower = Faster).
async function typeLine(text, delay = 15) {
  for (const char of text) {
    term.write(char);
    await new Promise((r) => setTimeout(r, delay));
  }
  term.write("\r\n"); // Press Enter after the line
}

// === ANIMATED WELCOME FUNCTION ===
async function showWelcomeMessage() {
  // Define Colors for cleaner code
  const magenta = "\x1b[1;35m";
  const cyan = "\x1b[1;36m";
  const green = "\x1b[32m";
  const gray = "\x1b[90m";
  const italic = "\x1b[3m";
  const reset = "\x1b[0m";

  term.clear(); // Wipe screen before starting

  // 1. Header (Fast)
  await typeLine(`${magenta} ABX-TERMINAL v1.2 /// SYSTEM ONLINE ${reset}`, 5);
  await typeLine(" ------------------------------------------------", 1);

  // 2. User Info (Standard Speed)
  await typeLine(
    ` User Identity Verified: ${cyan}M.Abdullah Iqbal${reset}`,
    15
  );
  await typeLine(
    ` Role: ${green}CS Major @ FAST-NU${reset} | ${green}Aspiring Computer Scientist${reset}`,
    10
  );
  await typeLine(" ------------------------------------------------", 1);

  // 3. System Checks (Add slight pauses for realism)
  await new Promise((r) => setTimeout(r, 200)); // Processing pause...
  await typeLine(` ${gray}> Neural Link... ${green}Active${reset}`, 20);

  await new Promise((r) => setTimeout(r, 200)); // Processing pause...
  await typeLine(` ${gray}> Gemini 2.5...  ${green}Connected${reset}`, 20);

  // 4. Signature & Ready (Slow & Dramatic)
  await new Promise((r) => setTimeout(r, 400));
  await typeLine(
    `\r\n ${italic}${gray}Engineered & Developed by M.Abdullah Iqbal${reset}`,
    10
  );

  term.writeln("\r\n Ready for input, Commander.\r\n");
}

// === VOICE MODULE (IMPROVED) ===
let selectedVoice = null;

// Load voices when they are ready (Chrome/Electron loads them async)
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  console.log("=== AVAILABLE VOICES ===");
  voices.forEach((v) => console.log(`Name: ${v.name} | Lang: ${v.lang}`));

  // PRIORITY LIST: Try to find these specific high-quality voices
  selectedVoice =
    voices.find((v) => v.name.includes("Google US English")) || // Best free one usually
    voices.find((v) => v.name.includes("Microsoft Aria Online (Natural)")) || // Amazing if available
    voices.find((v) => v.name.includes("Natural")) ||
    voices.find((v) => v.name.includes("Zira")); // Fallback
};

function speak(text) {
  if (!text) return;

  // 1. Stop any current speech
  window.speechSynthesis.cancel();

  // 2. Clean text
  const cleanText = text.replace(/^AI:\s*/i, "").trim();

  // 3. Create utterance
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // 4. Assign the best voice we found
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // 5. TUNING: Make it sound more "AI" and less "GPS"
  utterance.rate = 1.05; // Slightly faster
  utterance.pitch = 0.9; // Slightly lower (more serious)

  // 6. Speak
  window.speechSynthesis.speak(utterance);
}
// // Initial Bootup Sequence
setTimeout(() => {
  fitAddon.fit();

  // === 1. THE GHOST MANEUVER 👻 ===
  // This secretly navigates to your specific OneDrive Desktop folder
  const magicPath = "cd C:\\Users\\abdul\\OneDrive\\Desktop";
  ipcRenderer.send("terminal-keystroke", magicPath + "\r\n");

  // === 2. HIDE THE EVIDENCE ===
  // We wait 100ms for the CD command to finish, then clear the screen
  // and start the cool typewriter animation.
  setTimeout(() => {
    term.clear();
    showWelcomeMessage();
  }, 100);

  // === THE FINAL SCROLLBAR KILLER ===
  const css = `
        .xterm-viewport::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
        }
        .xterm-viewport::-webkit-scrollbar-thumb {
            display: none !important;
        }
    `;
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
  // =================================
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
      }, 1800); // Small delay for dramatic effect
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
      if (isExplicitAI || isImplicitAI) {
        term.writeln("\x1b[35m [AI] Processing...\x1b[0m");

        const instruction = isExplicitAI ? rawCommand.substring(1) : rawCommand;

        try {
          const aiResponse = await askGemini(instruction);

          // === CRITICAL FIX: DEFENSIVE CODING ===
          // We check if aiResponse exists AND is a string before using it.
          if (!aiResponse || typeof aiResponse !== "string") {
            throw new Error("AI returned an empty or invalid response.");
          }

          // === BATCH EXECUTION LOGIC ===

          // 1. IS IT A COMMAND? (Handles Single & Batch)
          if (aiResponse.startsWith("CMD:")) {
            const rawCmds = aiResponse.replace("CMD:", "").trim();
            // Split by our special delimiter
            const commandList = rawCmds.split("|||");

            for (const cmd of commandList) {
              const cleanCmd = cmd.trim();
              if (cleanCmd) {
                term.writeln("\x1b[35m [AI] Queueing: " + cleanCmd + "\x1b[0m");
                ipcRenderer.send("terminal-keystroke", cleanCmd + "\r\n");

                // Small delay so commands don't trip over each other
                await new Promise((r) => setTimeout(r, 300));
              }
            }
          }

          // 2. IS IT CHAT?
          else if (aiResponse.startsWith("AI:")) {
            const chatText = aiResponse.replace("AI:", "").trim();
            term.writeln("\r\n\x1b[1;36m AI: " + chatText + "\x1b[0m\r\n");
            speak(chatText);
          }

          // 3. FALLBACK (Safety Net)
          // If the AI forgets the prefix, treat it as chat to be safe
          else {
            term.writeln("\r\n\x1b[1;36m AI: " + aiResponse + "\x1b[0m\r\n");
            speak(aiResponse);
          }
        } catch (err) {
          // This catches any TypeErrors or Network errors and prints them safely
          console.error("Processing Error:", err);
          term.writeln(
            "\r\n\x1b[31m [SYSTEM ERROR] " + err.message + "\x1b[0m\r\n"
          );
        }
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
  const starCount = 200;
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

// === WIDGET SYSTEM VITALITY ===
function startLiveStats() {
  const cpuBar = document.getElementById("cpu-bar");
  const ramBar = document.getElementById("ram-bar");
  const cpuText = document.getElementById("cpu-val"); // Get text element
  const ramText = document.getElementById("ram-val"); // Get text element
  const netStatus = document.querySelector(".status-text");

  // We update the stats every 2 seconds
  setInterval(() => {
    // 1. Simulate CPU (Random fluctuation between 20% and 80%)
    const cpuVal = Math.floor(Math.random() * 60) + 20;

    // 2. Simulate RAM (Random fluctuation between 40% and 90%)
    const ramVal = Math.floor(Math.random() * 50) + 40;

    // 3. Apply the width to the bars
    if (cpuBar) cpuBar.style.width = `${cpuVal}%`;
    if (cpuText) cpuText.innerText = `${cpuVal}%`; // Update number

    if (ramBar) ramBar.style.width = `${ramVal}%`;
    if (ramText) ramText.innerText = `${ramVal}%`; // Update number

    // 4. Random "Network Glitch" (Rarely flickers to OFFLINE)
    // 95% chance to be ONLINE, 5% chance of a blip
    if (netStatus) {
      const isOnline = Math.random() > 0.05;
      netStatus.innerText = isOnline ? "ONLINE" : "OFFLINE";
      netStatus.className = isOnline
        ? "status-text online"
        : "status-text offline";

      // If offline, turn text red (you'll need a CSS rule for .offline)
      if (!isOnline) netStatus.style.color = "#ef4444";
      else netStatus.style.color = ""; // Reset to CSS default
    }
  }, 2000); // 2000ms = 2 seconds
}

// Start the simulation
startLiveStats();
