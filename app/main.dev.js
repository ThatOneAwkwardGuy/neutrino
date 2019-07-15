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
  STORE_CAPTCHA_JOB
} from './constants/ipcConstants';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

global.captchaQueue = {};

let mainWindow = null;
let captchaWindow = null;

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
  captchaWindow = new BrowserWindow({
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
  captchaWindow.loadURL(`file://${__dirname}/app.html#/captcha`);
};

/**
 * Add event listeners...
 */

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

  initialiseCaptchaWindow();

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
    templateUrl: `${__dirname}/splash.html`,
    splashScreenOpts: {
      width: 400,
      frame: false,
      height: 400,
      center: true,
      transparent: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html#/home`);
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
  // eslint-disable-next-line
  new AppUpdater();

  ipcMain.on(OPEN_CAPTCHA_WINDOW, () => {
    if (captchaWindow.isDestroyed()) {
      initialiseCaptchaWindow();
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
});
