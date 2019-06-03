import path from 'path';
import url from 'url';
import { app, crashReporter, BrowserWindow, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import {
  CAPTCHA_RECEIVE_COOKIES_AND_CAPTCHA_PAGE,
  BOT_SEND_COOKIES_AND_CAPTCHA_PAGE,
  OPEN_CAPTCHA_WINDOW,
  RESET_CAPTCHA_WINDOW,
  SET_GLOBAL_ID_VARIABLE,
  SET_DISCORD_RPC_STATE,
  RESET_CAPTCHA_TOKENS_ARRAY,
  RECEIVE_RESET_CAPTCHA_TOKENS_ARRAY,
  SEND_CAPTCHA_TOKEN,
  RECEIVE_CAPTCHA_TOKEN,
  FINISH_SENDING_CAPTCHA_TOKEN,
  MAIN_PROCESS_CLEAR_RECEIVE_CAPTCHA_TOKEN_LISTENERS,
  CHECK_FOR_UPDATES,
  UPDATE_AVAILABLE,
  NO_UPDATE_AVAILABLE,
  UPDATE_DOWNLOADED,
  START_INSTALL
} from './utils/constants';
const puppeteer = require('puppeteer-core');
const ipcMain = require('electron').ipcMain;
const DiscordRPC = require('discord-rpc');
const isDevelopment = process.env.NODE_ENV === 'development';
const clientId = '575360564767752194';
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();
let mainWindow = null;
let captchaWindow = null;
let forceQuit = false;
let discordRPCState = '';
const version = app.getVersion();
DiscordRPC.register(clientId);

let initialiseCaptchaWindow = () => {
  captchaWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
      allowRunningInsecureContent: true,
      webSecurity: false
    },
    modal: true,
    show: false,
    minWidth: 200,
    minHeight: 300,
    width: 500,
    height: 650,
    frame: false,
    resizable: true,
    focusable: true,
    minimizable: true,
    closable: true
  });
  captchaWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: 'captcha'
    })
  );
};

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  for (const name of extensions) {
    try {
      await installer.default(installer[name], forceDownload);
    } catch (e) {
      console.log(`Error installing ${name} extension: ${e.message}`);
    }
  }
};

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (isDevelopment) {
    await installExtensions();
    autoUpdater.updateConfigPath = path.join(__dirname, '..', 'dev-app-update.yml');
  }
  createMenu();

  mainWindow = new BrowserWindow({
    height: 650,
    width: 1000,
    minHeight: 325,
    minWidth: 450,
    frame: false,
    resizable: true
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  initialiseCaptchaWindow();

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app

    if (process.platform === 'darwin') {
      mainWindow.on('close', function(e) {
        if (!forceQuit) {
          e.preventDefault();
          mainWindow.hide();
        }
      });

      app.on('activate', () => {
        mainWindow.show();
      });

      app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
        captchaWindow = null;
      });
    }
  });

  if (isDevelopment) {
    // auto-open dev tools
    mainWindow.webContents.openDevTools();

    // add inspect element on right click menu
    mainWindow.webContents.on('context-menu', (e, props) => {
      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(props.x, props.y);
          }
        }
      ]).popup(mainWindow);
    });
  }

  ipcMain.on(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, (event, args) => {
    captchaWindow.send(CAPTCHA_RECEIVE_COOKIES_AND_CAPTCHA_PAGE, args);
  });

  ipcMain.on(OPEN_CAPTCHA_WINDOW, (event, arg) => {
    if (captchaWindow.isDestroyed()) {
      initialiseCaptchaWindow();
      captchaWindow.show();
    } else {
      captchaWindow.show();
    }
  });

  ipcMain.on(MAIN_PROCESS_CLEAR_RECEIVE_CAPTCHA_TOKEN_LISTENERS, (event, arg) => {
    ipcMain.removeAllListeners(RECEIVE_CAPTCHA_TOKEN);
  });

  ipcMain.on(RESET_CAPTCHA_TOKENS_ARRAY, (event, arg) => {
    captchaWindow.send(RECEIVE_RESET_CAPTCHA_TOKENS_ARRAY, 'reset');
  });

  ipcMain.on(SET_GLOBAL_ID_VARIABLE, (event, arg) => {
    global.captcaTokenID = arg;
    event.returnValue = true;
  });

  ipcMain.on(SET_DISCORD_RPC_STATE, (event, arg) => {
    discordRPCState = arg.state;
    event.returnValue = true;
  });

  ipcMain.on(SEND_CAPTCHA_TOKEN, (event, arg) => {
    mainWindow.send(RECEIVE_CAPTCHA_TOKEN, arg);
    console.log(arg.id);
  });

  ipcMain.on(FINISH_SENDING_CAPTCHA_TOKEN, (event, arg) => {
    captchaWindow.send(FINISH_SENDING_CAPTCHA_TOKEN, arg);
  });

  ipcMain.on(RESET_CAPTCHA_WINDOW, (event, arg) => {
    if (captchaWindow.isDestroyed()) {
      initialiseCaptchaWindow();
      captchaWindow.show();
    }
    captchaWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'captcha'
      })
    );
  });

  autoUpdater.on('update-available', info => {
    mainWindow.send(UPDATE_AVAILABLE, info);
  });

  autoUpdater.on('update-not-available', info => {
    mainWindow.send(NO_UPDATE_AVAILABLE, info);
  });

  autoUpdater.on('update-downloaded', info => {
    mainWindow.send(UPDATE_DOWNLOADED, info);
  });

  ipcMain.on(START_INSTALL, () => {
    const electron = require('electron');
    const BrowserWindow = electron.BrowserWindow;
    app.removeAllListeners('window-all-closed');
    app.removeAllListeners('before-quit');
    var browserWindows = BrowserWindow.getAllWindows();
    browserWindows.forEach(function(browserWindow) {
      browserWindow.removeAllListeners('close');
      browserWindow.close();
    });
    mainWindow.destroy();
    autoUpdater.quitAndInstall(false, true);
  });

  ipcMain.on(CHECK_FOR_UPDATES, () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on(START_UPDATE, () => {
    autoUpdater.downloadUpdate();
  });

  rpc.on('ready', () => {
    // activity can only be set every 15 seconds
    setInterval(() => {
      setActivity();
    }, 60e3);
  });

  rpc.login({ clientId }).catch(console.error);
});

function setActivity() {
  rpc.setActivity({
    details: `Version - ${version}`,
    state: discordRPCState,
    startTimestamp,
    largeImageKey: 'logo_small',
    smallImageKey: 'logo_small',
    instance: false
  });
}

function createMenu() {
  const application = {
    label: 'Neutrino',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  };

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  };

  const dev = {
    label: 'Dev',
    submenu: [
      {
        label: 'Refresh',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  };

  const template = [application, edit];

  if (isDevelopment) {
    template.push(dev);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
