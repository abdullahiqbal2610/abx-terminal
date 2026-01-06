// Load the environment variables
require("dotenv").config();

async function askGemini(instruction) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return "Write-Host 'Error: API Key missing in .env file'";
  }

  // === SWITCHED TO GEMINI 2.5 FLASH ===
  // This is the specific 2026 stable model you requested.
  const MODEL_NAME = "gemini-2.5-flash";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const prompt = `
    You are an  AI Assistant terminal developed by M.Abdullah Iqbal (CS Junior @ FAST-NU).
    User Instruction: "${instruction}"
    
    CRITICAL RULES:
    1. If the user asks to DO something (create folder, list files), output ONLY the PowerShell command.
    2. If the user asks a QUESTION (e.g., "What is the capital?", "Hello"), you MUST prefix your answer with "AI: ".
       - CORRECT: "AI: The capital is Islamabad."
       - INCORRECT: "Islamabad"
    3. If creating files, ALWAYS use '-Force'.
    4. If the instruction is dangerous, return "Write-Host 'Command blocked for safety'".
    `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    // Handle API Errors (like 404 Model Not Found or 429 Quota)
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return `Write-Host 'AI Error: ${data.error.message}'`;
    }

    if (!data.candidates || !data.candidates[0]) {
      return "Write-Host 'AI Error: No response generated.'";
    }

    const result = data.candidates[0].content.parts[0].text.trim();
    return result.replace(/```powershell|```/g, "").trim();
  } catch (error) {
    return "Write-Host 'Network Error: Could not connect to AI.'";
  }
}

module.exports = { askGemini };
