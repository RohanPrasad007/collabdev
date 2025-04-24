const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  dialog,
  contextBridge,
} = require("electron");
const path = require("path");

let mainWindow;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // Disable for security
      contextIsolation: true, // Enable for security
      enableRemoteModule: false, // Disable for security
      sandbox: true, // Enable for security
      preload: path.join(__dirname, "preload.js"), // Add preload script
    },
  });

  mainWindow.maximize();
  mainWindow.loadURL("http://localhost:3000");
};

// Create a preload.js file in your root directory
// This is where we'll safely expose Electron APIs
app.whenReady().then(() => {
  createWindow();

  // IPC handlers (same as before)
  ipcMain.handle("get-screen-sources", async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 800, height: 600 },
    });
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    }));
  });

  ipcMain.handle("show-screen-picker", async (event, sources) => {
    const { response } = await dialog.showMessageBox({
      buttons: sources.map((s) => s.name),
      title: "Select Source",
      message: "Choose what to share",
    });
    return response === -1 ? null : sources[response];
  });
});
