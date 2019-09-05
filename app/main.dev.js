/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import * as Splashscreen from '@trodi/electron-splashscreen';
import MenuBuilder from './menu';
import {
  OPEN_CAPTCHA_WINDOW,
  SEND_CAPTCHA_TOKEN_FROM_RENDERER,
  SEND_CAPTCHA_TOKEN_FROM_MAIN,
  STORE_CAPTCHA_JOB,
  STOP_CAPTCHA_JOB,
  SET_DISCORD_RPC_STATE,
  START_UPDATE,
  UPDATE_AVAILABLE,
  NO_UPDATE_AVAILABLE,
  CHECK_FOR_UPDATES
} from './constants/ipcConstants';

const DiscordRPC = require('discord-rpc');

const clientId = '575360564767752194';
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let discordRPCState = '';
const startTimestamp = new Date();
const version = app.getVersion();
DiscordRPC.register(clientId);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.autoDownload = false;
    autoUpdater.on('update-downloaded', () => {
      app.removeAllListeners('window-all-closed');
      app.removeAllListeners('before-quit');
      const browserWindows = BrowserWindow.getAllWindows();
      browserWindows.forEach(browserWindow => {
        browserWindow.removeAllListeners('close');
      });
      browserWindows.forEach(browserWindow => {
        browserWindow.close();
      });
      if (mainWindow !== null && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
      }
      autoUpdater.quitAndInstall(false, true);
    });
    autoUpdater.on('update-available', info => {
      mainWindow.send(UPDATE_AVAILABLE, info);
    });
    autoUpdater.on('update-not-available', info => {
      mainWindow.send(NO_UPDATE_AVAILABLE, info);
    });
  }
}

log.catchErrors();
global.captchaQueue = {};

let mainWindow = null;
let captchaWindow;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

process.on('uncaughtException', (err, origin) => {
  log.error(err, origin);
});

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const initialiseCaptchaWindow = () => {
  const initialisedCaptchaWindow = new BrowserWindow({
    webPreferences: {
      webviewTag: true,
      contextIsolation: false,
      allowRunningInsecureContent: true,
      webSecurity: false,
      nodeIntegration: true
    },
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
  initialisedCaptchaWindow.loadURL(`file://${__dirname}/app.html#/captcha`);
  return initialisedCaptchaWindow;
};

const setActivity = () => {
  rpc.setActivity({
    details: `Version - ${version}`,
    state: discordRPCState,
    startTimestamp,
    largeImageKey: 'logo_small',
    smallImageKey: 'logo_small',
    instance: false
  });
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = Splashscreen.initSplashScreen({
    windowOpts: {
      show: false,
      frame: false,
      center: true,
      width: 1224,
      height: 728,
      webPreferences: {
        nodeIntegration: true
      }
    },
    minVisible: 3000,
    templateUrl:
      process.env.NODE_ENV === 'development'
        ? `${__dirname}/splash.html`
        : `${app.getAppPath()}/app/splash.html`,
    splashScreenOpts: {
      width: 400,
      frame: false,
      height: 400,
      center: true,
      transparent: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html#/home`);

  captchaWindow = initialiseCaptchaWindow();

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line no-new
  new AppUpdater();

  ipcMain.on(OPEN_CAPTCHA_WINDOW, () => {
    if (captchaWindow.isDestroyed()) {
      captchaWindow = initialiseCaptchaWindow();
      captchaWindow.show();
    } else {
      captchaWindow.show();
    }
  });

  ipcMain.on(SEND_CAPTCHA_TOKEN_FROM_RENDERER, (event, arg) => {
    captchaWindow.webContents.send(SEND_CAPTCHA_TOKEN_FROM_MAIN, arg);
  });

  ipcMain.on(STORE_CAPTCHA_JOB, (event, id, arg) => {
    global.captchaQueue[id] = arg;
  });

  ipcMain.on('send-captcha-token-from-preload-to-captcha', (event, arg) => {
    captchaWindow.webContents.send(
      'send-captcha-token-from-preload-to-captcha',
      arg
    );
  });

  ipcMain.on('send-captcha-token-from-captcha-to-renderer', (event, arg) => {
    mainWindow.webContents.send(
      'send-captcha-token-from-captcha-to-renderer',
      arg
    );
  });

  ipcMain.on(SET_DISCORD_RPC_STATE, (event, arg) => {
    discordRPCState = arg.state;
  });

  ipcMain.on(CHECK_FOR_UPDATES, () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on(START_UPDATE, () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on(STOP_CAPTCHA_JOB, (event, arg) => {
    captchaWindow.webContents.send(STOP_CAPTCHA_JOB, arg);
  });

  rpc.on('ready', () => {
    setInterval(() => {
      setActivity();
    }, 60e3);
  });
});

app.on('login', event => {
  event.preventDefault();
});
