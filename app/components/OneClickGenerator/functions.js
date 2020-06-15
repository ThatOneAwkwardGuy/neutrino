import path from 'path';
import {
  brands,
  questionWordList,
  auxiliaryVerbList,
  subjectList,
  actionVerbList
} from './constants';
import { setProxyForWindow } from '../../utils/utils';

const { remote } = require('electron');
const { BrowserWindow } = require('electron').remote;
const uuidv4 = require('uuid/v4');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const appPath = remote.app.getAppPath();
puppeteer.use(StealthPlugin());

export const createActivityWindow = async (
  win,
  index,
  activity,
  settings,
  updateActivity,
  showAcitivtyWindows
) =>
  new Promise(async resolve => {
    if (updateActivity) {
      updateActivity(index, { status: 'Logging In' });
    }
    if (!showAcitivtyWindows && !process.platform === 'win32') {
      win.minimize();
    }
    if (!win.isDestroyed()) {
      win.webContents.once('close', () => {
        if (updateActivity) {
          updateActivity(index, { status: 'Not Started' });
        }
        resolve();
      });
      win.loadURL('https://google.com');
      win.webContents.setAudioMuted(true);
      win.webContents.once('did-finish-load', async () => {
        await win.webContents.executeJavaScript(
          'document.querySelector(\'a[target="_top"]\').click();'
        );
        win.webContents.once('did-finish-load', async () => {
          await win.webContents.executeJavaScript(`
                      document.getElementById("Email").value = "${activity.email}";
                      document.getElementById("next").click();
                      `);
          win.webContents.once('did-finish-load', async () => {
            await win.webContents.executeJavaScript(`
                          var canvas = document.querySelector("input[type='password']")
                          if (canvas) {
                            canvas.value = "${activity.pass}";
                            document.querySelector("input[type='submit']").click();
                          }
                        `);
            win.webContents.on('did-finish-load', async () => {
              const documentHTML = await win.webContents.executeJavaScript(
                'document.documentElement.innerHTML',
                false
              );
              const windowLocation = await win.webContents.executeJavaScript(
                'window.location',
                false
              );
              if (
                documentHTML.includes(activity.email) ||
                windowLocation.pathname === '/'
              ) {
                if (updateActivity) {
                  updateActivity(index, { status: 'Logged In' });
                }
                win.webContents.removeAllListeners('did-finish-load');
                resolve(win);
              } else if (updateActivity) {
                updateActivity(index, { status: 'Stuck In Login' });
              }
              // if (windowLocation1.pathname === '/') {
              //   updateActivity(index, { status: 'Logged In' });
              //   resolve();
              // } else if (updateActivity) {
              //   updateActivity(index, { status: 'Stuck In Login' });
              // }
            });
          });
        });
      });
    }
  });

export const createPuppeteerActivityWindow = async (
  index,
  activity,
  settings,
  updateActivity,
  showAcitivtyWindows
) => {
  if (updateActivity) {
    updateActivity(index, { status: 'Launching Browser Instance' });
  }
  const args = [
    '--mute-audio',
    '--disable-web-security',
    '--allow-running-insecure-content'
  ];
  const proxyArray = activity.proxy.split(/@|:/);
  if (activity.proxy !== '') {
    args.push(
      `--proxy-server=http://${
        proxyArray.length === 4 ? proxyArray[2] : proxyArray[0]
      }:${proxyArray.length === 4 ? proxyArray[3] : proxyArray[1]}`
    );
  }
  const browser = await puppeteer.launch({
    args,
    executablePath: getChromeExecutablePath(),
    headless: !showAcitivtyWindows,
    ignoreHTTPSErrors: true,
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  if (proxyArray.length === 4) {
    await page.authenticate({
      username: proxyArray[0],
      password: proxyArray[1]
    });
  }
  if (process.platform === 'win32') {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    );
  } else {
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    );
  }

  browser.on('disconnected', () => {
    if (updateActivity) {
      updateActivity(index, { status: 'Not Started' });
    }
  });
  page.on('close', () => {
    if (updateActivity) {
      updateActivity(index, { status: 'Not Started' });
    }
    browser.close();
  });
  if (updateActivity) {
    updateActivity(index, { status: 'Loading Google Sign In Page' });
  }
  await page.goto('https://stackoverflow.com/users/login', {
    waitUntil: 'domcontentloaded'
  });
  await page.click('button[data-provider="google"]');

  await page.waitFor('input[type="email"]', {
    visible: true,
    timeout: 10000
  });
  if (updateActivity) {
    updateActivity(index, { status: 'Entering Email' });
  }
  await page.type('input[type="email"]', activity.email);
  await page.click('#identifierNext');
  // await page.click('input[type="submit"]');
  await page.waitFor('input[type="password"]', {
    visible: true,
    timeout: 10000
  });
  if (updateActivity) {
    updateActivity(index, { status: 'Entering Password' });
  }
  await page.type('input[type="password"]', activity.pass);
  await page.click('#passwordNext');
  // await page.click('input[type="submit"]');
  if (updateActivity) {
    updateActivity(index, { status: 'Logging In' });
  }
  return new Promise(resolve => {
    page.on('domcontentloaded', () => {
      const pageUrl = page.url();
      if (
        pageUrl.includes('myaccount.google') ||
        pageUrl.includes('stackoverflow.com')
      ) {
        if (updateActivity) {
          updateActivity(index, { status: 'Logged In' });
        }
        resolve(browser);
      }
    });
  });
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const randomFromArray = providedArray =>
  providedArray[Math.floor(Math.random() * providedArray.length)];

const randomPuppeteerGoogleSearch = async (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  console.log(window);
  updateActivity(index, { status: 'Google Search' });
  const question = `${randomFromArray(questionWordList)} ${randomFromArray(
    auxiliaryVerbList
  )} ${randomFromArray(subjectList)} ${randomFromArray(actionVerbList)}`;
  const page = await window.newPage();
  await page.goto(`https://www.google.com/search?q=${encodeURI(question)}`);
  incrementActivity(index, 'googleSearch');
};

const randomPuppeteerGoogleNewsSearch = async (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  console.log(window);

  updateActivity(index, { status: 'Google News' });
  const chosenQuery = randomFromArray(brands);
  const page = await window.newPage();
  await page.goto(
    `https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=nws`
  );
  incrementActivity(index, 'googleNews');
};

const randomPuppeteerGoogleShoppingSearch = async (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  console.log(window);

  updateActivity(index, { status: 'Google Shopping' });
  const chosenQuery = `buy ${randomFromArray(brands)}`;
  const page = await window.newPage();
  await page.goto(
    `https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=shop`
  );
  incrementActivity(index, 'googleShopping');
};

const randomPuppeteerTrendingYoutubeVideo = async (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  console.log(window);

  updateActivity(index, { status: 'Watching Youtube' });
  const page = await window.newPage();
  await page.goto('https://www.youtube.com/feed/trending');
  const links = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('#thumbnail.ytd-thumbnail'),
      element => element.href
    )
  );
  const chosenLink = links[Math.floor(Math.random() * links.length)];
  page.click(`a[href='/${chosenLink.split('/').pop()}']`);
  incrementActivity(index, 'youtube');
};

export const runPuppeteerActivitiesOnWindow = async (
  window,
  index,
  settings,
  updateActivity,
  incrementActivity,
  activity
) => {
  const functions = [];
  if (settings.activityGoogleSearch) {
    functions.push(randomPuppeteerGoogleSearch);
  }
  if (settings.activityGoogleNews) {
    functions.push(randomPuppeteerGoogleNewsSearch);
  }
  if (settings.activityGoogleShopping) {
    functions.push(randomPuppeteerGoogleShoppingSearch);
  }
  if (settings.activityYoutube) {
    functions.push(randomPuppeteerTrendingYoutubeVideo);
  }
  runPuppeteerActivityOnWindow(
    window,
    index,
    settings,
    functions,
    updateActivity,
    incrementActivity
  );

  if (settings.oneClickCheckTimingBool) {
    updateActivity(index, {
      lastTimeTested: new Date()
    });
    const testInterval = setInterval(async () => {
      if (!windowStillOpen(window)) {
        clearInterval(testInterval);
        return;
      }
      const [oneClickStatus, oneClickV3Score] = await Promise.all([
        testPuppeteerAccount(index, activity, settings, false),
        testPuppeteerAccountV3(index, activity, settings, false)
      ]);
      updateActivity(index, {
        oneClickStatus,
        oneClickV3Score,
        lastTimeTested: new Date()
      });
    }, settings.oneClickCheckTiming * 60000);
  }
};

export const testActivityWindow = async (index, activity, settings) =>
  testAccountPromise(index, activity, settings);

const runPuppeteerActivityOnWindow = async (
  window,
  index,
  settings,
  functions,
  updateActivity,
  incrementActivity
) => {
  try {
    const randTime =
      Math.round(
        Math.random() *
          (parseInt(settings.activityDelayMax, 10) -
            parseInt(settings.activityDelayMin, 10))
      ) + parseInt(settings.activityDelayMin, 10);
    const randomFunction = randomFromArray(functions);
    randomFunction.call(null, window, index, updateActivity, incrementActivity);
    await sleep(randTime);
    if (windowStillOpen(window)) {
      runPuppeteerActivityOnWindow(
        window,
        index,
        settings,
        functions,
        updateActivity,
        incrementActivity
      );
    }
  } catch (error) {
    console.error(error);
  }
};

export const testAccountPromise = async (
  index,
  activity,
  settings,
  setAccountStatus
) =>
  new Promise(async resolve => {
    const tokenID = uuidv4();
    const win = new BrowserWindow({
      width: 500,
      height: 650,
      show: true,
      frame: true,
      resizable: true,
      focusable: true,
      minimizable: true,
      closable: true,
      webPreferences: {
        webviewTag: true,
        session: remote.session.fromPartition(`activity-${tokenID}`)
      }
    });
    win.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        const requestHeaders = { ...details.requestHeaders };
        requestHeaders['User-Agent'] = details.url.includes('google')
          ? 'Chrome'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36';
        callback({ requestHeaders });
      }
    );
    if (activity.proxy !== '') {
      await setProxyForWindow(activity.proxy, this.windows[index]);
    }
    const loggedInWindow = await createActivityWindow(
      win,
      index,
      activity,
      settings,
      false,
      true
    );
    if (loggedInWindow) {
      loggedInWindow.webContents.once('close', () => {
        setAccountStatus(index, 'Not Started');
        resolve();
      });
      loggedInWindow.loadURL('https://neutrinotools.app/captcha');
      loggedInWindow.webContents.on('dom-ready', async () => {
        const currentURL = await loggedInWindow.webContents.executeJavaScript(
          'window.location.href',
          false
        );
        if (currentURL === 'https://neutrinotools.app/captcha') {
          await loggedInWindow.webContents.executeJavaScript(
            'grecaptcha.execute()',
            false
          );
          loggedInWindow.webContents.once('did-navigate-in-page', async () => {
            const windowLocation2 = await loggedInWindow.webContents.executeJavaScript(
              'window.location.hash',
              false
            );
            if (windowLocation2 === '#success') {
              resolve('One Click Success');
              if (setAccountStatus) {
                setAccountStatus(index, 'One Click Success');
              }
            } else {
              resolve('One Click Fail');
              if (setAccountStatus) {
                setAccountStatus(index, 'One Click Fail');
              }
            }
            loggedInWindow.webContents.removeAllListeners('close', () => {});
            loggedInWindow.close();
          });
        }
      });
    } else {
      resolve();
    }
  });

export const getChromeExecutablePath = () => {
  if (process.platform === 'win32') {
    return process.env.NODE_ENV === 'development'
      ? path.resolve(`${appPath}/../chrome/chrome-win/chrome.exe`)
      : path.resolve(`${process.resourcesPath}/chrome/chrome-win/chrome.exe`);
  }
  return process.env.NODE_ENV === 'development'
    ? path.resolve(
        `${appPath}/../chrome/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
      )
    : path.resolve(
        `${process.resourcesPath}/chrome/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
      );
};

export const testPuppeteerAccount = async (
  index,
  activity,
  settings,
  setAccountStatus
) => {
  const browser = await createPuppeteerActivityWindow(
    index,
    activity,
    settings,
    false,
    false
  );
  const page = await browser.newPage();
  await page.goto('https://neutrinotools.app/captcha', {
    waitFor: 'networkidle0'
  });
  const url = page.url();
  if (url.includes('neutrinotools.app/captcha')) {
    page.evaluate('grecaptcha.execute()');
    return new Promise(async (resolve, reject) => {
      try {
        page.once('framenavigated', async () => {
          const captchaTestResult = await page.evaluate('window.location.hash');
          if (captchaTestResult === '#success') {
            if (setAccountStatus) {
              setAccountStatus(index, 'One Click Success');
            }
            resolve(true);
            await browser.close();
          }
          if (setAccountStatus) {
            setAccountStatus(index, 'One Click Fail');
          }
          await browser.close();
          resolve(false);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
};

export const testPuppeteerAccountV3 = async (
  index,
  activity,
  settings,
  setAccountStatus
) => {
  const browser = await createPuppeteerActivityWindow(
    index,
    activity,
    settings,
    false,
    false
  );
  const page = await browser.newPage();
  await page.goto('https://neutrinotools.app/captchaV3', {
    waitFor: 'networkidle0'
  });
  const url = page.url();
  if (url.includes('neutrinotools.app/captcha')) {
    page.evaluate('grecaptcha.execute()');
    return new Promise((resolve, reject) => {
      try {
        page.once('framenavigated', async () => {
          const captchaTestResult = await page.evaluate('window.location.hash');
          if (setAccountStatus) {
            setAccountStatus(index, captchaTestResult.slice(1));
          }
          resolve(captchaTestResult.slice(1));
          await browser.close();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
};

export const windowStillOpen = window => {
  if (window) {
    const windowProcess = window.process();
    if (windowProcess.connected) {
      return true;
    }
    return false;
  }
  return false;
};
