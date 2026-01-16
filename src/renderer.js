const { ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");
const { FitAddon } = require("@xterm/addon-fit");
const path = require("path");
const os = require("os");
const fs = require("fs");
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

// ===============================================
// === 🎵 PRO AUDIO ENGINE (HI-FI SYNTHESIS) ===
// ===============================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SoundSys = {
  // 1. MECHANICAL THOCK (Deep, Short, Clean)
  playClick: () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;

    // The "Body" of the switch (Deep Sine)
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.03); // Fast drop

    // The "Click" (Filtered High)
    const osc2 = audioCtx.createOscillator();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(2000, t);

    // Gain Envelopes (Short and snappy)
    const gain = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    gain2.gain.setValueAtTime(0.05, t); // Very quiet click
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.02);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(audioCtx.destination);
    gain2.connect(audioCtx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.05);
    osc2.stop(t + 0.05);
  },

  // 2. AI DATA STREAM (Digital Flutter)
  playAiChirp: () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Melodic Arpeggio (Futuristic Major Chord)
    osc.frequency.setValueAtTime(880, t); // A5
    osc.frequency.setValueAtTime(1108, t + 0.05); // C#6
    osc.frequency.setValueAtTime(1318, t + 0.1); // E6
    osc.frequency.setValueAtTime(1760, t + 0.15); // A6

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  // 3. STARTUP SWELL (Cinematic Drone)
  playStartup: () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;

    // Oscillator 1: Root Note (Deep)
    const osc1 = audioCtx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(110, t); // A2

    // Oscillator 2: The Fifth (Harmony)
    const osc2 = audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(164.8, t); // E3

    // Lowpass Filter Sweep (The "Opening" Effect)
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 1.5); // Opens up brightly

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.5); // Smooth fade in
    gain.gain.linearRampToValueAtTime(0, t + 2.5); // Long fade out

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 2.5);
    osc2.stop(t + 2.5);
  },

  // 4. ERROR (Subtle Bass Bump)
  playError: () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.3);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  },

  // 5. SHUTDOWN (The "Clean Power Cut")
  playShutdown: () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;

    // A pure Sine wave dropping smoothly
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t); // Start High (Alert)
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.8); // Drop to Deep Bass

    // Volume fade out
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    // Sub-bass layer for weight
    const subOsc = audioCtx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(150, t);
    subOsc.frequency.linearRampToValueAtTime(20, t + 1.8);

    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.linearRampToValueAtTime(0, t + 1.8);

    osc.connect(gain);
    subOsc.connect(subGain);

    gain.connect(audioCtx.destination);
    subGain.connect(audioCtx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 2.0);
    subOsc.stop(t + 2.0);
  },
};

// ===============================================

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

// === FORCE HIDE SCROLLBAR ===
const style = document.createElement("style");
style.textContent = `
    ::-webkit-scrollbar { display: none !important; width: 0 !important; }
    .xterm-viewport::-webkit-scrollbar { display: none !important; width: 0 !important; }
`;
document.head.appendChild(style);

// === TYPEWRITER HELPER (SILENT STARTUP LOGIC) ===
async function typeLine(text, delay = 15, silent = false) {
  const isTypingEffect = delay > 5;

  for (const char of text) {
    term.write(char);
    // Only play sound if NOT silent AND it's a typing effect AND not a space
    if (!silent && isTypingEffect && char !== " ") {
      // Tiny random variation for realism
      if (Math.random() > 0.3) SoundSys.playClick();
    }
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
    process.cwd(),
    path.join(homeDir, "OneDrive", "Desktop"),
    path.join(homeDir, "Desktop"),
  ];

  words.forEach((word) => {
    if (word.includes(".") && !word.startsWith("http")) {
      const cleanFileName = word.replace(/[?!,"']/g, "").trim();

      for (const basePath of searchPaths) {
        const potentialPath = path.isAbsolute(cleanFileName)
          ? cleanFileName
          : path.join(basePath, cleanFileName);

        if (fs.existsSync(potentialPath)) {
          try {
            const content = fs.readFileSync(potentialPath, "utf-8");
            fileContext += `\n\n--- CONTEXT: CONTENT OF ${cleanFileName} ---\n${content}\n--- END OF FILE ---\n`;
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
  // Play New Cinematic Startup
  SoundSys.playStartup();

  const magenta = "\x1b[1;35m";
  const cyan = "\x1b[1;36m";
  const gray = "\x1b[90m";
  const italic = "\x1b[3m";
  const reset = "\x1b[0m";

  term.clear();

  // Silent during the big swell to avoid clutter
  await typeLine(
    `${magenta} ABX-TERMINAL v1.2 /// SYSTEM ONLINE ${reset}`,
    5,
    true
  );
  await typeLine(" ------------------------------------------------", 1, true);
  await typeLine(
    ` User Identity Verified: ${cyan}M.Abdullah Iqbal${reset}`,
    15,
    true
  );
  await typeLine(
    ` Role: ${cyan}CS Major @ FAST-NU${reset} | ${cyan}Aspiring Computer Scientist${reset}`,
    10,
    true
  );
  await typeLine(" ------------------------------------------------", 1, true);

  await new Promise((r) => setTimeout(r, 200));
  await typeLine(` ${gray}> Neural Link... ${cyan}Active${reset}`, 20, true);

  await new Promise((r) => setTimeout(r, 200));
  await typeLine(` ${gray}> Gemini 2.5...  ${cyan}Connected${reset}`, 20, true);

  await new Promise((r) => setTimeout(r, 400));
  // Sound ON for the final signature
  await typeLine(
    `\r\n ${italic}${gray}Engineered & Developed by M.Abdullah Iqbal${reset}`,
    10,
    false
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
  const magicPath = "cd C:\\Users\\abdul\\OneDrive\\Desktop";
  ipcRenderer.send("terminal-keystroke", magicPath + "\r\n");

  setTimeout(() => {
    term.clear();
    showWelcomeMessage();
  }, 100);

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
  // Play CLICK on key press
  if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
    SoundSys.playClick();
  }

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
      SoundSys.playShutdown(); // Play new clean shutdown
      term.writeln(
        "\r\n\x1b[31m [SYSTEM] Initiating Shutdown Sequence...\x1b[0m"
      );
      term.writeln("\x1b[31m [SYSTEM] Disconnecting Neural Link...\x1b[0m");
      setTimeout(() => {
        ipcRenderer.send("app-close");
      }, 2000); // Set to 2000ms as requested
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

      SoundSys.playAiChirp();

      const instruction = isExplicitAI ? rawCommand.substring(1) : rawCommand;
      const finalPrompt = augmentPromptWithFiles(instruction);

      try {
        const aiResponse = await askGemini(finalPrompt);

        if (!aiResponse || typeof aiResponse !== "string") {
          throw new Error("AI returned an empty or invalid response.");
        }

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
        } else if (aiResponse.startsWith("AI:")) {
          const chatText = aiResponse.replace("AI:", "").trim();
          term.writeln("\r\n\x1b[1;36m AI:\x1b[0m");
          writeSmart(chatText);
          term.write("\r\n");
          speak(chatText);
        } else {
          term.writeln("\r\n\x1b[1;36m AI:\x1b[0m");
          writeSmart(aiResponse);
          term.write("\r\n");
          speak(aiResponse);
        }
      } catch (err) {
        SoundSys.playError();
        console.error("Processing Error:", err);
        term.writeln(
          "\r\n\x1b[31m [SYSTEM ERROR] " + err.message + "\x1b[0m\r\n"
        );
      }
    } else {
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
