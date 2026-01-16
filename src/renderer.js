const { ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");
const { FitAddon } = require("@xterm/addon-fit");
const path = require("path");
const os = require("os");
const fs = require("fs"); // Required for file reading
const { exec } = require("child_process");

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

// === TYPEWRITER HELPER ===
async function typeLine(text, delay = 15) {
  for (const char of text) {
    term.write(char);
    await new Promise((r) => setTimeout(r, delay));
  }
  term.write("\r\n");
}

// === SMART WORD WRAPPER ===
function writeSmart(text) {
  const maxWidth = term.cols - 2;

  const paragraphs = text.split("\n");
  paragraphs.forEach((paragraph) => {
    if (paragraph.length <= maxWidth) {
      term.writeln(paragraph);
    } else {
      const words = paragraph.split(" ");
      let currentLine = "";
      words.forEach((word) => {
        if ((currentLine + word).length > maxWidth) {
          term.writeln(currentLine);
          currentLine = word + " ";
        } else {
          currentLine += word + " ";
        }
      });
      if (currentLine) term.writeln(currentLine);
    }
  });
}

// === CONTEXT INJECTION (SMART READER) ===
function augmentPromptWithFiles(inputText) {
  const words = inputText.split(" ");
  let fileContext = "";

  const homeDir = os.homedir();
  const searchPaths = [
    process.cwd(), // 1. App Folder
    path.join(homeDir, "OneDrive", "Desktop"), // 2. OneDrive Desktop
    path.join(homeDir, "Desktop"), // 3. Standard Desktop
  ];

  words.forEach((word) => {
    // Check if word looks like a file (has extension)
    if (word.includes(".") && !word.startsWith("http")) {
      const cleanFileName = word.replace(/[?!,"']/g, "").trim();

      for (const basePath of searchPaths) {
        const potentialPath = path.isAbsolute(cleanFileName)
          ? cleanFileName
          : path.join(basePath, cleanFileName);

        if (fs.existsSync(potentialPath)) {
          try {
            const content = fs.readFileSync(potentialPath, "utf-8");
            // Inject content clearly for AI
            fileContext += `\n\n--- CONTEXT: CONTENT OF ${cleanFileName} ---\n${content}\n--- END OF FILE ---\n`;
            console.log(`[System] Successfully read: ${cleanFileName}`);
            break;
          } catch (err) {
            console.error(`[System] Error reading ${cleanFileName}:`, err);
          }
        }
      }
    }
  });

  return inputText + fileContext;
}

// === ANIMATED WELCOME FUNCTION ===
async function showWelcomeMessage() {
  const magenta = "\x1b[1;35m";
  const cyan = "\x1b[1;36m";
  const gray = "\x1b[90m";
  const italic = "\x1b[3m";
  const reset = "\x1b[0m";

  term.clear();

  // 1. Header
  await typeLine(`${magenta} ABX-TERMINAL v1.2 /// SYSTEM ONLINE ${reset}`, 5);
  await typeLine(" ------------------------------------------------", 1);

  // 2. User Info
  await typeLine(
    ` User Identity Verified: ${cyan}M.Abdullah Iqbal${reset}`,
    15
  );
  await typeLine(
    ` Role: ${cyan}CS Major @ FAST-NU${reset} | ${cyan}Aspiring Computer Scientist${reset}`,
    10
  );
  await typeLine(" ------------------------------------------------", 1);

  // 3. System Checks
  await new Promise((r) => setTimeout(r, 200));
  await typeLine(` ${gray}> Neural Link... ${cyan}Active${reset}`, 20);

  await new Promise((r) => setTimeout(r, 200));
  await typeLine(` ${gray}> Gemini 2.5...  ${cyan}Connected${reset}`, 20);

  // 4. Signature
  await new Promise((r) => setTimeout(r, 400));
  await typeLine(
    `\r\n ${italic}${gray}Engineered & Developed by M.Abdullah Iqbal${reset}`,
    10
  );

  term.writeln("\r\n Ready for input, Commander.\r\n");
}

// === VOICE MODULE ===
let selectedVoice = null;
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  selectedVoice =
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.name.includes("Microsoft Aria Online")) ||
    voices.find((v) => v.name.includes("Natural")) ||
    voices.find((v) => v.name.includes("Zira"));
};

function speak(text) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/^AI:\s*/i, "").trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 1.05;
  utterance.pitch = 0.9;
  window.speechSynthesis.speak(utterance);
}

// === BOOTUP SEQUENCE ===
setTimeout(() => {
  fitAddon.fit();

  // Ghost Maneuver: Navigate to Desktop silently
  const magicPath = "cd C:\\Users\\abdul\\OneDrive\\Desktop";
  ipcRenderer.send("terminal-keystroke", magicPath + "\r\n");

  setTimeout(() => {
    term.clear();
    showWelcomeMessage();
  }, 100);

  // Final Scrollbar Killer
  const css = `
        .xterm-viewport::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .xterm-viewport::-webkit-scrollbar-thumb { display: none !important; }
    `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}, 100);

// LISTEN FOR OUTPUT
ipcRenderer.on("terminal-incoming", (event, data) => {
  term.write(data);
});

// === COMMAND HISTORY & INPUT HANDLING ===
const inputField = document.getElementById("commandInput");
let commandHistory = [];
let historyIndex = -1;

inputField.addEventListener("keydown", async (e) => {
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

  // --- EXECUTE COMMAND ---
  else if (e.key === "Enter") {
    const rawCommand = inputField.value.trim();
    if (!rawCommand) return;

    term.writeln(`\r\n\x1b[1;36m❯ ${rawCommand}\x1b[0m`);

    commandHistory.push(rawCommand);
    historyIndex = -1;
    inputField.value = "";

    // 1. GOD MODE CHECK
    if (executeSystemCommand(rawCommand)) {
      return;
    }

    // 2. CLOSE CHECK
    const closeCommands = ["exit", "quit", "bye", "over n out"];
    if (closeCommands.includes(rawCommand.toLowerCase())) {
      term.writeln(
        "\r\n\x1b[31m [SYSTEM] Initiating Shutdown Sequence...\x1b[0m"
      );
      term.writeln("\x1b[31m [SYSTEM] Disconnecting Neural Link...\x1b[0m");
      setTimeout(() => {
        ipcRenderer.send("app-close");
      }, 2000);
      return;
    }

    // 3. CLS CHECK
    if (
      rawCommand.toLowerCase() === "cls" ||
      rawCommand.toLowerCase() === "clear"
    ) {
      term.clear();
      ipcRenderer.send("terminal-keystroke", "cls\r\n");
      setTimeout(() => {
        showWelcomeMessage();
      }, 50);
      return;
    }

    // 4. AI PROCESSING
    const aiTriggers = [
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

      // === INJECT FILES HERE ===
      const finalPrompt = augmentPromptWithFiles(instruction);

      try {
        const aiResponse = await askGemini(finalPrompt);

        if (!aiResponse || typeof aiResponse !== "string") {
          throw new Error("AI returned an empty or invalid response.");
        }

        // BATCH CMD LOGIC
        if (aiResponse.startsWith("CMD:")) {
          const rawCmds = aiResponse.replace("CMD:", "").trim();
          const commandList = rawCmds.split("|||");

          for (const cmd of commandList) {
            const cleanCmd = cmd.trim();
            if (cleanCmd) {
              term.writeln("\x1b[35m [AI] Queueing: " + cleanCmd + "\x1b[0m");
              ipcRenderer.send("terminal-keystroke", cleanCmd + "\r\n");
              await new Promise((r) => setTimeout(r, 300));
            }
          }
        }
        // CHAT LOGIC
        else if (aiResponse.startsWith("AI:")) {
          const chatText = aiResponse.replace("AI:", "").trim();
          term.writeln("\r\n\x1b[1;36m AI:\x1b[0m"); // Header
          writeSmart(chatText); // Use Smart Wrapper
          term.write("\r\n");
          speak(chatText);
        }
        // FALLBACK
        else {
          term.writeln("\r\n\x1b[1;36m AI:\x1b[0m");
          writeSmart(aiResponse); // Use Smart Wrapper
          term.write("\r\n");
          speak(aiResponse);
        }
      } catch (err) {
        console.error("Processing Error:", err);
        term.writeln(
          "\r\n\x1b[31m [SYSTEM ERROR] " + err.message + "\x1b[0m\r\n"
        );
      }
    } else {
      // Pass-through to standard shell
      ipcRenderer.send("terminal-keystroke", rawCommand + "\r\n");
    }
  }
});

// ESCAPE TO CLOSE
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") ipcRenderer.send("app-close");
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

// === REAL-TIME HARDWARE MONITOR ===
function startLiveStats() {
  const cpuBar = document.getElementById("cpu-bar");
  const ramBar = document.getElementById("ram-bar");
  const cpuText = document.getElementById("cpu-val");
  const ramText = document.getElementById("ram-val");
  const netStatus = document.querySelector(".status-text");

  function getCpuInfo() {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0;
    for (let cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }
    return { idle, total: user + nice + sys + idle + irq };
  }

  let startMeasure = getCpuInfo();

  setInterval(() => {
    const endMeasure = getCpuInfo();
    const idleDiff = endMeasure.idle - startMeasure.idle;
    const totalDiff = endMeasure.total - startMeasure.total;
    const cpuFinal = Math.round(
      totalDiff === 0 ? 0 : (1 - idleDiff / totalDiff) * 100
    );
    startMeasure = endMeasure;

    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const ramFinal = Math.round((usedMem / totalMem) * 100);

    if (cpuBar) cpuBar.style.width = `${cpuFinal}%`;
    if (cpuText) cpuText.innerText = `${cpuFinal}%`;
    if (ramBar) ramBar.style.width = `${ramFinal}%`;
    if (ramText) ramText.innerText = `${ramFinal}%`;
  }, 1000);

  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    if (netStatus) {
      netStatus.innerText = isOnline ? "ONLINE" : "OFFLINE";
      netStatus.className = isOnline
        ? "status-text online"
        : "status-text offline";
    }
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();
}
startLiveStats();

// === GOD MODE SYSTEM CONTROL ===
function executeSystemCommand(rawInput) {
  const input = rawInput.trim();
  const lowerInput = input.toLowerCase();

  if (lowerInput.startsWith("search ") || lowerInput.startsWith("google ")) {
    const query = input.split(" ").slice(1).join(" ");
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    term.writeln(
      `\r\n\x1b[36m[SYSTEM] Searching Neural Net for: "${query}"...\x1b[0m`
    );
    exec(`start "" "${url}"`);
    return true;
  }

  if (
    lowerInput.startsWith("open ") &&
    (lowerInput.includes(".com") || lowerInput.includes("http"))
  ) {
    let url = input.split(" ")[1];
    if (!url.startsWith("http")) url = "https://" + url;
    term.writeln(`\r\n\x1b[36m[SYSTEM] Establishing Uplink: ${url}...\x1b[0m`);
    exec(`start "" "${url}"`);
    return true;
  }

  if (
    lowerInput.startsWith("launch ") ||
    lowerInput.startsWith("run ") ||
    lowerInput.startsWith("start ")
  ) {
    const appName = input.split(" ").slice(1).join(" ");
    term.writeln(
      `\r\n\x1b[32m[SYSTEM] Executing Protocol: ${appName}.exe\x1b[0m`
    );
    exec(`start ${appName}`);
    return true;
  }

  const quickMap = {
    calc: "calc",
    calculator: "calc",
    notepad: "notepad",
    code: "code .",
    files: "explorer .",
    spotify: "start spotify:",
    cmd: "start cmd",
  };

  if (quickMap[lowerInput]) {
    term.writeln(`\r\n\x1b[32m[SYSTEM] Quick Launch: ${lowerInput}\x1b[0m`);
    exec(quickMap[lowerInput]);
    return true;
  }

  return false;
}
