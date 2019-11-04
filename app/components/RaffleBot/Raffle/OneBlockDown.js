import { ipcRenderer } from 'electron';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { createNewWindow } from '../../../utils/utils';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

export default class OneBlockDown {
  constructor(
    url,
    profile,
    site,
    style,
    size,
    status,
    proxy,
    raffleDetails,
    forceUpdate,
    incrementRaffles
  ) {
    this.tokenID = uuidv4();
    this.url = url;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.proxy = proxy;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
    this.cookieJar = rp.jar();
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    };
    this.rp = rp.defaults({
      headers: this.headers,
      proxy,
      jar: this.cookieJar
    });
  }

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  start = async () => {
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.error(error);
        this.changeStatus(`Error Submitting Raffle - ${error.message}`);
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
    ipcRenderer.send(STOP_CAPTCHA_JOB, this.tokenID);
  };

  getCaptchaCode = () =>
    new Promise(async (resolve, reject) => {
      const window = await createNewWindow(this.tokenID, this.proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL(this.raffleDetails.raffleLink);
      window.webContents.once('dom-ready', async () => {
        // const captcha = await window.webContents.executeJavaScript();
      });
    });

  submitEntry = captchaCode =>
    this.rp({
      method: 'POST',
      uri: this.raffleDetails.raffleLink,
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        // 'x-chrome-connected':
        //   'id=116241489796738701984,mode=0,enable_account_consistency=false,consistency_enabled_by_default=false',
        // 'x-client-data':
        //   'CJS2yQEIpbbJAQjEtskBCKmdygEIvJ/KAQioo8oBCL+lygEI4qjKAQi3qsoBCJetygEIza3KAQjLrsoBCMqvygEIibTKAQ=='
        referrer: this.raffleDetails.raffleLink,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      body: `emailAddress=${encodeURIComponent(
        this.profile.email
      )}&entry.954890343_sentinel=&entry.954890343=I+authorize+to+use+these+personal+informations+to+fulfill+my+request.&emailReceipt=true&g-recaptcha-response=${captchaCode}=1&draftResponse=%5B%5B%5Bnull%2C335994697%2C%5B%22${encodeURIComponent(
        this.profile.deliveryFirstName
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C1498124700%2C%5B%22${encodeURIComponent(
        this.profile.deliveryLastName
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C127092856%2C%5B%22${encodeURIComponent(
        this.size.id
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C2002540466%2C%5B%22Rest+of+the+World%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C131976353%2C%5B%22${encodeURIComponent(
        this.profile.deliveryAddress
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C276400575%2C%5B%22%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C1301233171%2C%5B%22${encodeURIComponent(
        this.profile.deliveryCity
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C1388226044%2C%5B%22${encodeURIComponent(
        this.profile.deliveryCountry
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C535685551%2C%5B%22${encodeURIComponent(
        this.profile.deliveryRegion
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C1067573424%2C%5B%22${encodeURIComponent(
        this.profile.deliveryZip
      )}%22%5D%0D%0A%2C0%5D%0D%0A%2C%5Bnull%2C875982424%2C%5B%22${encodeURIComponent(
        this.profile.phone
      )}%22%5D%0D%0A%2C0%5D%0D%0A%5D%0D%0A%2Cnull%2C%221222919992288943397%22%2Cnull%2Cnull%2Cnull%2C%22${encodeURIComponent(
        this.profile.email
      )}%22%2C1%5D%0D%0A&pageHistory=0%2C1%2C2%2C3%2C4&fbzx=${encodeURIComponent(
        this.raffleDetails.shuffleSeed
      )}`
    });

  makeEntry = async () => {
    await this.getCaptchaCode();
  };

  // makeEntry = async () => {
  //   const fields = this.raffleDetails.googleFormDetails[1][1]
  //     .filter(arr => arr.length === 5)
  //     .map(arr => ({ name: arr[1], id: arr[4][0][0] }))
  //     .reduce((acc, cur) => {
  //       acc[cur.name] = cur.id;
  //       return acc;
  //     }, {});
  //   return new Promise(async (resolve, reject) => {
  //     const window = await createNewWindow(this.tokenID, this.proxy);
  //     window.webContents.on('close', () => {
  //       reject(new Error('Closed Window Before Finished'));
  //     });
  //     window.loadURL(this.raffleDetails.raffleLink);
  //     window.webContents.once('dom-ready', async () => {
  //       await window.webContents.executeJavaScript(
  //         `document.querySelector('[name="emailAddress"]').value = "${
  //           this.profile.email
  //         }";
  //         document.querySelector('[name="entry.${
  //           fields['First Name']
  //         }"]').value = "${this.profile.deliveryFirstName}";
  //         document.querySelector('[name="entry.${
  //           fields['Last Name']
  //         }"]').value = "${this.profile.deliveryLastName}";
  //         document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]').click();`
  //       );
  //       window.webContents.once('dom-ready', async () => {
  //         await window.webContents.executeJavaScript(
  //           `document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`
  //         );
  //         window.webContents.once('dom-ready', async () => {
  //           await window.webContents.executeJavaScript(
  //             `document.querySelector('[name="entry.${
  //               fields['Size (US)']
  //             }"]').value = "${this.size.id}";
  //             document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`
  //           );
  //         });
  //       });
  //     });
  //   });
  // };
}

// makeEntry = async () =>
// new Promise(async (resolve, reject) => {
//   const window = await createNewWindow(this.tokenID, this.proxy);
//   window.webContents.on('close', () => {
//     reject(new Error('Closed Window Before Finished'));
//   });
//   window.loadURL(this.raffleDetails.raffleLink);
//   window.webContents.once('dom-ready', async () => {
//     await window.webContents.executeJavaScript(
//       `
//     document.querySelector('input[aria-label="Your email address"]').value = "${this.profile.email}";
//     document.querySelector('textarea[aria-label="First Name"]').value = "${this.profile.deliveryFirstName}";
//     document.querySelector('textarea[aria-label="Last Name"]').value = "${this.profile.deliveryLastName}";
//     document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]').click();
//     `,
//       false
//     );
//     window.webContents.once('dom-ready', async () => {
//       await window.webContents.executeJavaScript(
//         `document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`,
//         false
//       );
//       window.webContents.once('dom-ready', async () => {
//         await window.webContents.executeJavaScript(
//           `document.querySelector('[role="listbox"] .quantumWizMenuPaperselectOption').click();`,
//           false
//         );
//         await sleep(500);
//         await window.webContents.executeJavaScript(
//           `document.querySelector('.exportSelectPopup .quantumWizMenuPaperselectOption[data-value="${this.size.id}"]').click();`,
//           false
//         );
//         await sleep(500);
//         await window.webContents.executeJavaScript(
//           `document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`,
//           false
//         );
//         window.webContents.once('dom-ready', async () => {
//           await window.webContents.executeJavaScript(
//             `document.querySelector('[role="listbox"] .quantumWizMenuPaperselectOption').click();`,
//             false
//           );
//           await sleep(500);
//           await window.webContents.executeJavaScript(
//             `document.querySelector('.exportSelectPopup .quantumWizMenuPaperselectOption[data-value="${this.size.id}"]').click();`,
//             false
//           );
//           await sleep(500);
//           await window.webContents.executeJavaScript(
//             `document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`,
//             false
//           );
//         });
//       });
//     });
//   });
// });
