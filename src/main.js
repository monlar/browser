// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, ipcMain, shell, globalShortcut } from "electron";
const process = require('process');
import log from "electron-log";
import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

// Commondline params
// Url for open
const rootPath = app.commandLine.getSwitchValue("root-path");
// Log root path
log.transports.file.resolvePath = () => `${rootPath}/tmp/browser.${env.name}.log`;
// Log path arguments
log.info(`Root path ${rootPath}`);
// Url for open
const argUrl = app.commandLine.getSwitchValue("url");
// Log url arguments
log.info(`Will load url ${argUrl}`);

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  app.setPath("userData", `${rootPath}/tmp/brower(${env.name})`);
} else {
  app.setPath("userData", `${rootPath}/tmp/brower`);
}

// Menu
const setApplicationMenu = () => {
  Menu.setApplicationMenu(null);
};

// We can communicate with our window (the renderer process) via messages.
const initIpc = () => {
  ipcMain.on("need-app-path", (event, arg) => {
    event.reply("app-path", app.getAppPath());
  });
  ipcMain.on("open-external-link", (event, href) => {
    shell.openExternal(href);
  });
};

app.on("ready", () => {
  setApplicationMenu();
  initIpc();
  // Main window
  let mainWindow = createWindow("main", {
    webPreferences: {
      // For param
      nodeIntegration: false,
      // Spectron needs access to remote module
      enableRemoteModule: env.name === "test"
    }
  });
  // Open url
  mainWindow.loadURL(argUrl);
  // Fullscreen when start up
  mainWindow.setFullScreen(true);
  // When closed
	mainWindow.on('closed', function() {
		mainWindow = null
	})
  // Open dev tools
  if (env.name === "development") {
    // Open devtools
    mainWindow.openDevTools();
    
    // ESC for leave fullscreen
    globalShortcut.register('ESC', () => {
      mainWindow.setFullScreen(false);
    })
  }
});

// All window closed
app.on("window-all-closed", () => {
  app.quit();
});
