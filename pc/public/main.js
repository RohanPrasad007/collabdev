const { app, BrowserWindow, ipcMain } = require("electron");

const createWindow = async () => {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      //enableRemoteModule: true,
    },
  });

  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:3000"
  );
};


app.on("ready", () => {
  createWindow();
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
