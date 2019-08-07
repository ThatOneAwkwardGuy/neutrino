import {
  brands,
  questionWordList,
  auxiliaryVerbList,
  subjectList,
  actionVerbList
} from './constants';

const { remote } = require('electron');
const { BrowserWindow } = require('electron').remote;
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const cheerio = require('cheerio');

export const createActivityWindow = (
  index,
  activity,
  settings,
  updateActivity,
  showAcitivtyWindows
) =>
  new Promise(resolve => {
    if (updateActivity) {
      updateActivity(index, { status: 'Logging In' });
    }
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
      allowRunningInsecureContent: true,
      webPreferences: {
        webviewTag: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        webSecurity: false,
        session: remote.session.fromPartition(`activity-${tokenID}`)
      }
    });
    if (!showAcitivtyWindows) {
      win.minimize();
    }
    win.webContents.once('close', () => {
      updateActivity(index, { status: 'Not Started' });
    });
    win.loadURL('https://google.com');
    win.webContents.setAudioMuted(true);
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript(
        'document.querySelector(\'a[target="_top"]\').click();'
      );
      win.webContents.once('did-finish-load', () => {
        win.webContents.executeJavaScript(`
                      document.getElementById("Email").value = "${activity.email}";
                      document.getElementById("next").click();
                      `);
        win.webContents.once('did-navigate-in-page', () => {
          win.webContents.executeJavaScript(`
                        var passwdObserver = new MutationObserver(function(mutations, me) {
                          var canvas = document.getElementById("Passwd");
                          if (canvas) {
                            canvas.value = "${activity.pass}";
                            document.getElementById("signIn").click();
                            me.disconnect();
                            return;
                          }
                        });
                        passwdObserver.observe(document, {
                            childList: true,
                            attributes:true,
                            subtree: true,
                            characterData: true
                        })
                        `);
          win.webContents.once('did-finish-load', () => {
            win.webContents.executeJavaScript(
              'window.location',
              false,
              windowLocation1 => {
                if (windowLocation1.pathname === '/') {
                  updateActivity(index, { status: 'Logged In' });
                } else if (updateActivity) {
                  updateActivity(index, { status: 'Stuck In Login' });
                }
                resolve(win);
              }
            );
          });
        });
      });
    });
  });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const randomFromArray = providedArray =>
  providedArray[Math.floor(Math.random() * providedArray.length)];

const randomGoogleSearch = (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  updateActivity(index, { status: 'Google Search' });
  const question = `${randomFromArray(questionWordList)} ${randomFromArray(
    auxiliaryVerbList
  )} ${randomFromArray(subjectList)} ${randomFromArray(actionVerbList)}`;
  window.loadURL(`https://www.google.com/search?q=${encodeURI(question)}`);
  incrementActivity(index, 'googleSearch');
};

const randomGoogleNewsSearch = (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  updateActivity(index, { status: 'Google News' });
  const chosenQuery = randomFromArray(brands);
  window.loadURL(
    `https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=nws`
  );
  incrementActivity(index, 'googleNews');
};

const randomGoogleShoppingSearch = (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  updateActivity(index, { status: 'Google Shopping' });
  const chosenQuery = `buy ${randomFromArray(brands)}`;
  window.loadURL(
    `https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=shop`
  );
  incrementActivity(index, 'googleShopping');
};

const randomTrendingYoutubeVideo = async (
  window,
  index,
  updateActivity,
  incrementActivity
) => {
  updateActivity(index, { status: 'Watching Youtube' });
  const response = await rp({
    method: 'GET',
    uri: 'https://www.youtube.com/feed/trending',
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'upgrade-insecure-requests': '1',
      'x-client-data':
        'CKu1yQEIkLbJAQiitskBCMS2yQEIqZ3KAQioo8oBCL+nygEI7KfKAQjiqMoBGIKYygEY+aXKAQ=='
    }
  });
  const $ = cheerio.load(response);
  const thumbnailLinksArray = $('.yt-uix-sessionlink').toArray();
  const chosenVideo =
    thumbnailLinksArray[Math.floor(Math.random() * thumbnailLinksArray.length)];
  window.loadURL(
    `https://youtube.com${chosenVideo.attribs.href}?autoplay=1&mute=1`
  );
  incrementActivity(index, 'youtube');
};

export const runAcitivitiesOnWindow = (
  window,
  index,
  settings,
  updateActivity,
  incrementActivity
) => {
  const functions = [];
  if (settings.activityGoogleSearch) {
    functions.push(randomGoogleSearch);
  }
  if (settings.activityGoogleNews) {
    functions.push(randomGoogleNewsSearch);
  }
  if (settings.activityGoogleShopping) {
    functions.push(randomGoogleShoppingSearch);
  }
  if (settings.activityYoutube) {
    functions.push(randomTrendingYoutubeVideo);
  }
  runActivityOnWindow(
    window,
    index,
    settings,
    functions,
    updateActivity,
    incrementActivity
  );
};

const runActivityOnWindow = async (
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
    runActivityOnWindow(
      window,
      index,
      settings,
      functions,
      updateActivity,
      incrementActivity
    );
  } catch (error) {
    console.log(error);
  }
};
