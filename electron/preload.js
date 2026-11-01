const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the frontend
contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
  getAppVersion: () => '1.0.0-beta',
});
