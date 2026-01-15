// Load the environment variables
require("dotenv").config();

// === CONTEXT MEMORY ===
let chatHistory = [];

async function askGemini(instruction) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return "Write-Host 'Error: API Key missing in .env file'";
  }

  // Safety Check: Internet Connection
  if (!navigator.onLine) {
    return "Write-Host 'Offline Mode: internet connection required for AI.'";
  }

  const MODEL_NAME = "gemini-2.5-flash-lite";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  // === STRICT SYSTEM PROMPT ===
  const SYSTEM_PROMPT = `
    You are ABX-Terminal, an advanced AI terminal assistant developed by Muhammad Abdullah Iqbal.
    
    === CORE PROTOCOL ===
    Your goal is to parse natural language into specific PowerShell commands or helpful chat responses.
    
    === MODE 1: EXECUTION (Prefix: "CMD: ") ===
    TRIGGER: Use this when the user asks to perform ANY action on the system, files, or data.
    
    PERMITTED ACTIONS:
    - Creating, reading, updating, moving, OR DELETING specific user files/folders.
    - Running scripts, listing directories, checking status.
    
    CRITICAL RULES:
    1. "Creative to File": If user says "Write a poem to x.txt", this is a COMMAND.
    2. CHAINING: Split multiple steps with "|||". 
       - Ex: "CMD: mkdir Project ||| cd Project ||| New-Item index.html"
    3. SAFETY: Always use '-Force' for file operations.
    
    === MODE 2: INTERACTION (Prefix: "AI: ") ===
    TRIGGER: Use this ONLY for pure knowledge questions, greeting, or explanations.
    
    === MODE 3: SAFETY SHIELD ===
    TRIGGER: BLOCK ONLY catastrophic actions:
    - Formatting drives (Format-Volume, etc.)
    - Deleting critical system paths (C:\\Windows, System32).
    - Recursively wiping the root directory (/).
    
    ACTION: Return exactly: "AI: 🛡️ Command blocked for safety protocols."
    `;
  // Update History with User Input
  chatHistory.push({
    role: "user",
    parts: [{ text: instruction }],
  });

  // Limit History to last 20 turns
  if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  const payload = {
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...chatHistory,
    ],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return `Write-Host 'AI Server Error: ${response.statusText}'`;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return "Write-Host 'AI Error: No response generated.'";
    }

    const result = data.candidates[0].content.parts[0].text.trim();
    // Clean up markdown code blocks if the AI adds them
    const cleanResult = result.replace(/```powershell|```/g, "").trim();

    // Save AI response to history
    chatHistory.push({
      role: "model",
      parts: [{ text: cleanResult }],
    });

    return cleanResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Write-Host 'Network Error: Connection to AI Failed.'";
  }
}

module.exports = { askGemini };
