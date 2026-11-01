const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "PACA - Plataforma Aberta de Conhecimento e Aprendizagem",
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  // In production, load the built Next.js app. In dev, load the dev server.
  const isDev = process.env.NODE_ENV === 'development';
  mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../out/index.html')}`
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle native notifications sent from the frontend
  mainWindow.webContents.on('ipc-message', (event, channel, args) => {
    if (channel === 'notify') {
      new Notification({ 
        title: args.title, 
        body: args.body 
      }).show();
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app, window.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
