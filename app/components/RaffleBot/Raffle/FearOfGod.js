import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class FearOfGod {
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
    incrementRaffles,
    settings
  ) {
    this.tokenID = uuidv4();
    this.url = url;
    this.proxy = proxy;
    this.profile = profile;
    this.run = false;
    this.settings = settings;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.cookieJar = rp.jar();
    this.incrementRaffles = incrementRaffles;
    this.rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      proxy: proxy !== '' ? proxy : null,
      jar: this.cookieJar
    });
  }

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  start = async () => {
    console.log(this.proxy);
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.log(error);
        if (error.statusCode === 400) {
          this.changeStatus(`Try Again`);
        } else {
          this.changeStatus(`Error Submitting Raffle - ${error.message}`);
        }
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
    ipcRenderer.send(STOP_CAPTCHA_JOB, this.tokenID);
  };

  submitRaffle = captchaResponse =>
    this.rp({
      url: 'https://app.viralsweep.com/promo/enter',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        Authority: 'app.viralsweep.com',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Pragma: 'no-cache',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        origin: 'https://app.viralsweep.com',
        referer: this.raffleDetails.iframeSrc
      },
      resolveWithFullResponse: true,
      form: {
        id: this.raffleDetails.id,
        type: 'full',
        refer_source: 'https://codeyellow.io/api/releases_57.php',
        entry_source: this.url,
        first_name: this.profile.deliveryFirstName,
        last_name: this.profile.deliveryLastName,
        email: this.profile.email,
        email_again: '',
        [this.raffleDetails.sizeDropDown]: this.size.id,
        newsletter_subscribe: 'yes',
        agree_to_rules: 'yes',
        'g-recaptcha-response': captchaResponse.captchaToken
      },
      method: 'POST'
    });

  makeEntry = async () => {
    this.changeStatus('Getting Captcha');
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.raffleDetails.iframeSrc,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings
    });
    this.changeStatus('Submitting Raffle Entry');
    const raffleResponse = await this.submitRaffle(captchaResponse);
    const parsedRaffleResponse = JSON.parse(raffleResponse.body);
    if (parsedRaffleResponse.success === 1) {
      this.changeStatus(`Successful Entry`);
      this.incrementRaffles();
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
