import {
  brands,
  questionWordList,
  auxiliaryVerbList,
  subjectList,
  actionVerbList
} from './constants';

import { testAccountPromise } from '../OneClickTester/functions';

const rp = require('request-promise');
const cheerio = require('cheerio');

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
        updateActivity(index, { status: 'Not Started' });
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
                            var canvas = document.getElementById("Passwd");
                            if (canvas) {
                              canvas.value = "${activity.pass}";
                              document.getElementById("signIn").click();
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
                (documentHTML.includes(activity.email) ||
                  windowLocation.pathname === '/') &&
                updateActivity
              ) {
                updateActivity(index, { status: 'Logged In' });
                resolve();
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

export const runAcitivitiesOnWindow = async (
  window,
  index,
  settings,
  updateActivity,
  incrementActivity,
  activity
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

  if (settings.oneClickCheckTimingBool) {
    const oneClickStatusPre = await testActivityWindow(index, activity);
    updateActivity(index, { oneClickStatus: oneClickStatusPre });
  }

  if (settings.oneClickCheckTimingBool) {
    const testInterval = setInterval(async () => {
      if (window.isDestroyed()) {
        clearInterval(testInterval);
        return;
      }
      const oneClickStatus = await testActivityWindow(index, activity);
      updateActivity(index, { oneClickStatus });
    }, settings.oneClickCheckTiming * 60000);
  }
};

export const testActivityWindow = async (index, activity) => {
  const accountTestResponse = await testAccountPromise(index, activity);
  return accountTestResponse;
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
    if (!window.isDestroyed()) {
      runActivityOnWindow(
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
