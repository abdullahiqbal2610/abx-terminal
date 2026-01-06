const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let shellProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    titleBarStyle: "hidden",
    webPreferences: {
      // We don't even need preload anymore
      nodeIntegration: true, // ENABLED
      contextIsolation: false, // DISABLED
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile("index.html");

  // === FORCE POWERSHELL INTERACTIVE MODE ===
  // -NoLogo: Hides the startup copyright text
  // -NoExit: Keeps it running after a command
  const shell = "powershell.exe";
  const args = ["-NoLogo", "-NoExit", "-Command", "-"];

  console.log("Spawning PowerShell...");
  shellProcess = spawn(shell, args, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // 1. Send Output to UI
  shellProcess.stdout.on("data", (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("terminal-incoming", data.toString());
    }
  });

  shellProcess.stderr.on("data", (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("terminal-incoming", data.toString());
    }
  });

  // 2. Handle Input from UI
  ipcMain.on("terminal-keystroke", (event, command) => {
    if (shellProcess && shellProcess.stdin) {
      // Write the command + New Line (\r\n is safer for Windows)
      shellProcess.stdin.write(command + "\r\n");
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (shellProcess) shellProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
