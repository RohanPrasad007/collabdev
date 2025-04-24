const { contextBridge, ipcRenderer, desktopCapturer } = require("electron");

// Expose protected methods in a safe way
contextBridge.exposeInMainWorld("electronAPI", {
  getScreenSources: () => ipcRenderer.invoke("get-screen-sources"),
  showScreenPicker: (sources) =>
    ipcRenderer.invoke("show-screen-picker", sources),
  // Add other methods you need to expose
});
