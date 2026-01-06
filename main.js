const { app, BrowserWindow, ipcMain, session } = require("electron");
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
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // === PERMISSIONS ===
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") {
        return callback(true);
      }
      callback(false);
    }
  );

  mainWindow.loadFile("index.html");

  // === FORCE POWERSHELL INTERACTIVE MODE ===
  const shell = "powershell.exe";
  const args = ["-NoLogo", "-NoExit", "-Command", "-"];

  console.log("Spawning PowerShell...");

  // === REVERTED: REMOVED CWD SETTING ===
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
  app.quit();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (shellProcess) shellProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
