const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const currentWindow = windowManager.getCurrent();
const data = windowManager.sharedData.fetch(currentWindow.name);
const updateFunction = data.update;
const activity = data.data;
const rp = require('request-promise');
const cheerio = require('cheerio');
const brands = [
  'Google',
  'Apple',
  'Amazon',
  'Microsoft',
  'Tencent',
  'Facebook',
  'Visa',
  "McDonald's",
  'Alibaba',
  'AT&T',
  'IBM',
  'Verizon',
  'Marlboro',
  'Coca-Cola',
  'Mastercard',
  'UPS',
  'SAP',
  'Wells Fargo',
  'Disney',
  'The Home Depot',
  'China Mobile',
  'ICBC',
  'Starbucks',
  'Xfinity',
  'Deutsche Telekom',
  'Louis Vuitton',
  'Spectrum',
  'GE',
  'Nike',
  'PayPal',
  'Walmart',
  'Accenture',
  'Samsung',
  'Moutai',
  'American Express',
  'Toyota',
  'Vodafone',
  'Intel',
  'Hermès',
  'Budweiser',
  'Baidu',
  'Zara',
  'Ping An',
  "L'Oréal Paris",
  'Oracle',
  'Mercedes-Benz',
  'BMW',
  'Huawei',
  'China Construction Bank',
  'HSBC',
  'YouTube',
  'RBC',
  'Movistar',
  'Gucci',
  'NTT',
  'FedEx',
  'Cisco',
  'Citi',
  'JD.com',
  'HDFC Bank',
  'Netflix',
  'DHL',
  'Shell',
  'Pampers',
  'Orange',
  'TD',
  'Chase',
  'Commonwealth Bank of Australia',
  'Agricultural Bank of China',
  'Subway',
  'Colgate',
  'Costco',
  'J.P. Morgan',
  'ExxonMobil',
  'Adobe',
  'IKEA',
  'Bank of America',
  'Salesforce',
  'China Life',
  'US Bank',
  'Uber',
  'Siemens',
  'LinkedIn',
  'Bank of China',
  'Gillette',
  'AIA',
  'KFC',
  'Ebay',
  'HP',
  'SF Express',
  'Instagram',
  'ANZ',
  'ALDI',
  'BT',
  "Lowe's",
  'Ford',
  'Honda',
  'Pepsi',
  'BCA',
  'Adidas'
];
const questionWordList = ['who', 'what', 'where', 'when', 'how', 'why', 'how long', 'how often'];
const auxiliaryVerbList = ['do', 'have', 'can', 'should', 'may', 'will'];
const subjectList = ['I', 'you', 'we', 'they', 'he', 'she', 'it'];
const actionVerbList = [
  'Act',
  'Agree',
  'Arrive',
  'Ask',
  'Bake',
  'Bring',
  'Build',
  'Buy',
  'Call',
  'Climb',
  'Close',
  'Come',
  'Cry',
  'Dance',
  'Dream',
  'Drink',
  'Eat',
  'Enter',
  'Exit',
  'Fall',
  'Fix',
  'Give',
  'Go',
  'Grab',
  'Help',
  'Hit',
  'Hop',
  'Insult',
  'Joke',
  'Jump',
  'Kick',
  'Laugh',
  'Leave',
  'Lift',
  'Listen',
  'Make',
  'March',
  'Move',
  'Nod',
  'Open',
  'Play',
  'Push',
  'Read',
  'Ride',
  'Run',
  'Send',
  'Shout',
  'Sing',
  'Sit',
  'Smile',
  'Spend',
  'Stand',
  'Talk',
  'Think',
  'Throw',
  'Touch',
  'Turn',
  'Visit',
  'Vote',
  'Wait',
  'Walk',
  'Write',
  'Yell'
];
let webview;

import { Plugin, passChomeTest } from '../utils/stealth';

const plugin = new Plugin();
plugin.mockPluginsAndMimeTypes();
passChomeTest(window);

const setActivityToRunning = () => {
  activity.status = 'Started';
  updateFunction({ index: data.index, activity });
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getWebview = async () => {
  const webview = document.querySelector('webview');
  if (webview === null || webview === undefined) {
    await sleep(3000);
    getWebview();
  } else {
    return webview;
  }
};

const randomFromArray = providedArray => {
  return providedArray[Math.floor(Math.random() * providedArray.length)];
};

const randomGoogleSearch = () => {
  const question = `${randomFromArray(questionWordList)} ${randomFromArray(auxiliaryVerbList)} ${randomFromArray(subjectList)} ${randomFromArray(
    actionVerbList
  )}`;
  const changeURLGoogleSearch = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(question)}`);
    webview.removeEventListener('dom-ready', changeURLGoogleSearch);
    activity.searches += 1;
    // activity.status = `Google Search - ${question}`;
    activity.status = `Google Search`;
    updateFunction({ index: data.index, activity });
  };
  changeURLGoogleSearch();
};

const randomGoogleShoppingSearch = () => {
  const chosenQuery = `buy ${randomFromArray(brands)}`;
  const changeURLShoppingSearch = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=shop`);
    webview.removeEventListener('dom-ready', changeURLShoppingSearch);
    activity.shopping += 1;
    // activity.status = `Google Shopping Search - ${chosenQuery}`;
    activity.status = `Google Shopping Search`;
    updateFunction({ index: data.index, activity });
  };
  changeURLShoppingSearch();
};

const randomGoogleNewsSearch = () => {
  const chosenQuery = randomFromArray(brands);
  const changeURLNewsSearch = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=nws`);
    webview.removeEventListener('dom-ready', changeURLNewsSearch);
    activity.news += 1;
    // activity.status = `Google News Search - ${chosenQuery}`;
    activity.status = `Google News Search`;
    updateFunction({ index: data.index, activity });
  };
  changeURLNewsSearch();
};

const randomTrendingYoutubeVideo = async () => {
  const response = await rp({
    method: 'GET',
    uri: 'https://www.youtube.com/feed/trending',
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'upgrade-insecure-requests': '1',
      'x-client-data': 'CKu1yQEIkLbJAQiitskBCMS2yQEIqZ3KAQioo8oBCL+nygEI7KfKAQjiqMoBGIKYygEY+aXKAQ=='
    }
  });
  const $ = cheerio.load(response);
  const thumbnailLinksArray = $('.yt-uix-sessionlink').toArray();
  const chosenVideo = thumbnailLinksArray[Math.floor(Math.random() * thumbnailLinksArray.length)];
  const changeURLYoutubeVideo = () => {
    webview.loadURL(`https://youtube.com${chosenVideo.attribs.href}?autoplay=1&mute=1`);
    webview.removeEventListener('dom-ready', changeURLYoutubeVideo);
    activity.youtube += 1;
    // activity.status = `Watching Youtube Video - ${chosenVideo.attribs.title}`;
    activity.status = `Watching Youtube Video`;
    updateFunction({ index: data.index, activity });
  };
  changeURLYoutubeVideo();
};

const functionsArray = [randomGoogleSearch, randomGoogleShoppingSearch, randomGoogleNewsSearch, randomTrendingYoutubeVideo];

const loop = async () => {
  webview.removeEventListener('dom-ready', loop);
  const rand = Math.round(Math.random() * (data.activityDelayMax - data.activityDelayMin)) + data.activityDelayMin;
  const chosenFunction = functionsArray[Math.floor(Math.random() * functionsArray.length)];
  chosenFunction();
  await sleep(rand);
  loop();
};

const setCookieAndRunLoop = async () => {
  webview = await getWebview();
  setActivityToRunning();
  webview.addEventListener('dom-ready', loop);
};

currentWindow.object.on('close', e => {
  activity.status = 'Not Started';
  updateFunction({ index: data.index, activity });
});
// document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });

document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });

// if (data.data.activityProxy !== '') {
//   // const proxyArray = data.data.activityProxy.split(/@|:/);
//   // if (proxyArray.length === 4) {
//   //   win.webContents.session.on('login', (event, webContents, request, authInfo, callback) => {
//   //     callback(proxyArray[0], proxyArray[1]);
//   //   });
//   // }
//   // const proxyIpAndPort = proxyArray.slice(-2);
//   // win.webContents.session.setProxy({ proxyRules: `http=${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` }, () => {
//   //   document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });
//   // });

//   currentWindow.object.webContents.session.setProxy({ proxyRules: `http=${data.data.activityProxy},direct://` }, () => {
//     document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });
//   });
// } else {
//   document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });
// }
