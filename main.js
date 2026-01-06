const { app, BrowserWindow, ipcMain, session } = require("electron"); // <--- Added 'session' here
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
      nodeIntegration: true, // ENABLED
      contextIsolation: false, // DISABLED
      enableRemoteModule: true,
    },
  });

  // === NEW ADDITION: GRANT MICROPHONE PERMISSION ===
  // This must be done BEFORE loading the file
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") {
        return callback(true); // Approve Microphone access
      }
      callback(false);
    }
  );
  // =================================================

  mainWindow.loadFile("index.html");

  // === FORCE POWERSHELL INTERACTIVE MODE ===
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
      shellProcess.stdin.write(command + "\r\n");
    }
  });
}
ipcMain.on("app-close", () => {
  if (shellProcess) shellProcess.kill();
  app.quit(); // Kills the app completely
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (shellProcess) shellProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
