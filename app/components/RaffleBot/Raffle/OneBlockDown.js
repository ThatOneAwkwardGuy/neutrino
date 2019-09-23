import { ipcRenderer } from 'electron';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { createNewWindow } from '../../../utils/utils';
import { sleep } from '../functions';

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
        console.log(error);
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

  makeEntry = async () => {
    const fields = this.raffleDetails.googleFormDetails[1][1]
      .filter(arr => arr.length === 5)
      .map(arr => {
        return { name: arr[1], id: arr[4][0][0] };
      })
      .reduce(function(acc, cur, i) {
        acc[cur.name] = cur.id;
        return acc;
      }, {});
    new Promise(async (resolve, reject) => {
      const window = await createNewWindow(this.tokenID, this.proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL(this.raffleDetails.raffleLink);
      window.webContents.once('dom-ready', async () => {
        await window.webContents.executeJavaScript(
          `document.querySelector('[name="emailAddress"]').value = "${
            this.profile.email
          }";
          document.querySelector('[name="entry.${
            fields['First Name']
          }"]').value = "${this.profile.deliveryFirstName}";
          document.querySelector('[name="entry.${
            fields['Last Name']
          }"]').value = "${this.profile.deliveryLastName}";
          document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]').click();`
        );
        window.webContents.once('dom-ready', async () => {
          await window.webContents.executeJavaScript(
            `document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`
          );
          window.webContents.once('dom-ready', async () => {
            await window.webContents.executeJavaScript(
              `document.querySelector('[name="entry.${
                fields['Size (US)']
              }"]').value = "${this.size.id}";
              document.querySelector('.freebirdFormviewerViewNavigationNavControls .quantumWizButtonEl[role="button"]:nth-of-type(2)').click();`
            );
          });
        });
      });
    });
  };
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
