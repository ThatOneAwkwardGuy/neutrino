const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const currentWindow = windowManager.getCurrent();
const name = currentWindow.name;
const data = windowManager.sharedData.fetch(currentWindow.name);
const updateFunction = data.update;
const activity = data.data;
let webview = document.querySelector('webview');
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

setActivityToRunning = () => {
  activity.status = 'Started';
  updateFunction({ index: name.split('-')[1], activity });
};

sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

getWebview = async () => {
  const webview = document.querySelector('webview');
  if (webview === null) {
    await sleep(3000);
    getWebview;
  } else {
    return webview;
  }
};

convertCookieString = (baseURL, cookieString) => {
  if (cookieString.length > 0) {
    const cookieArray = cookieString.split(';');
    let formattedCookieArray = [];
    for (const cookie of cookieArray) {
      console.log(cookie);
      const nameValuePair = cookie.replace(/\s+/g, '').split(/=(.+)/);
      formattedCookieArray.push({
        url: baseURL.includes('supreme') ? `https://www.${baseURL.split('//')[1].split('/')[0]}` : `https://${baseURL}/`,
        value: nameValuePair[1],
        domain: '.' + baseURL,
        path: '/',
        name: nameValuePair[0]
      });
    }
    return formattedCookieArray;
  } else {
    return [];
  }
};

randomFromArray = providedArray => {
  return providedArray[Math.floor(Math.random() * providedArray.length)];
};

randomGoogleSearch = () => {
  const question = `${randomFromArray(questionWordList)} ${randomFromArray(auxiliaryVerbList)} ${randomFromArray(subjectList)} ${randomFromArray(
    actionVerbList
  )}`;
  const changeURL = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(question)}`);
    webview.removeEventListener('dom-ready', changeURL);
    activity.searches += 1;
    updateFunction({ index: name.split('-')[1], activity });
  };
  webview.addEventListener('dom-ready', changeURL);
};

randomGoogleShoppingSearch = () => {
  const chosenQuery = `buy ${randomFromArray(brands)}`;
  const changeURL = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=shop`);
    webview.removeEventListener('dom-ready', changeURL);
    activity.shopping += 1;
    updateFunction({ index: name.split('-')[1], activity });
  };
  webview.addEventListener('dom-ready', changeURL);
};

randomGoogleNewsSearch = () => {
  const chosenQuery = randomFromArray(brands);
  const changeURL = () => {
    webview.loadURL(`https://www.google.com/search?q=${encodeURI(chosenQuery)}&tbm=nws`);
    webview.removeEventListener('dom-ready', changeURL);
    activity.news += 1;
    updateFunction({ index: name.split('-')[1], activity });
  };
  webview.addEventListener('dom-ready', changeURL);
};

randomTrendingYoutubeVideo = async () => {
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
  const changeURL = () => {
    webview.loadURL(`http://youtube.com${chosenVideo.attribs.href}/?autoplay=1&mute=1`);
    webview.removeEventListener('dom-ready', changeURL);
    activity.youtube += 1;
    updateFunction({ index: name.split('-')[1], activity });
  };
  webview.addEventListener('dom-ready', changeURL);
};

const functionsArray = [randomGoogleSearch, randomGoogleShoppingSearch, randomGoogleNewsSearch, randomTrendingYoutubeVideo];

loop = () => {
  const rand = Math.round(Math.random() * (15000 - 9000)) + 9000;
  const chosenFunction = functionsArray[Math.floor(Math.random() * functionsArray.length)];
  chosenFunction();
  randomGoogleSearch();
  setTimeout(function() {
    const chosenFunction = functionsArray[Math.floor(Math.random() * functionsArray.length)];
    chosenFunction();
    loop();
  }, rand);
};

setCookieAndRunLoop = () => {
  webview = document.querySelector('webview');
  setActivityToRunning();
  const cookies = data.cookies;
  for (cookieSite in cookies) {
    const cookiesCookieSite = cookies[cookieSite]['/'];
    for (const actualCookie in cookiesCookieSite) {
      const formattedCookie = {
        url: `https://${cookieSite}/`,
        value: cookiesCookieSite[actualCookie].value,
        domain: cookiesCookieSite[actualCookie].domain,
        path: cookiesCookieSite[actualCookie].path,
        name: actualCookie
      };
      currentWindow.object.webContents.session.cookies.set(formattedCookie, error => {
        if (error !== null) {
          console.log(error);
        }
      });
    }
  }
  loop();
};

currentWindow.object.on('close', e => {
  activity.status = 'Not Started';
  updateFunction({ index: name.split('-')[1], activity });
});
if (data.data.activityProxy !== '') {
  currentWindow.object.webContents.session.setProxy({ proxyRules: data.proxy }, () => {
    document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });
  });
} else {
  document.addEventListener('DOMContentLoaded', setCookieAndRunLoop, { once: true });
}
