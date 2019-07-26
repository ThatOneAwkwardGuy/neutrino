import {
  BOT_SEND_COOKIES_AND_CAPTCHA_PAGE,
  OPEN_CAPTCHA_WINDOW,
  RECEIVE_CAPTCHA_TOKEN,
  FINISH_SENDING_CAPTCHA_TOKEN
} from '../constants';
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const ipcRenderer = require('electron').ipcRenderer;
export default class Bodega {
  constructor(
    url,
    profile,
    site,
    style,
    size,
    status,
    proxy,
    raffleDetails,
    forceUpdate
  ) {
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
  };

  getCaptcha = () => {
    return new Promise((resolve, reject) => {
      try {
        const tokenID = uuidv4();
        ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
        ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
          checkoutURL: `https://app.viralsweep.com/vrlswp/widget/${this.raffleDetails.widgetCode}?framed=1`,
          id: tokenID,
          type: 'VooStore',
          proxy: this.proxy,
          site: this.site
        });
        ipcRenderer.on(RECEIVE_CAPTCHA_TOKEN, async (event, captchaToken) => {
          if (captchaToken.id === tokenID) {
            ipcRenderer.send(FINISH_SENDING_CAPTCHA_TOKEN, {});
            resolve(captchaToken);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  getFormData = object => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
  };

  submitRaffle = captchaToken => {
    return this.rp({
      method: 'POST',
      uri: 'https://app.viralsweep.com/promo/enter',
      headers: {
        origin: 'https://app.viralsweep.com',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        accept: '*/*',
        referer: `https://app.viralsweep.com/vrlswp/widget/${this.raffleDetails.widgetCode}?framed=1`,
        authority: 'app.viralsweep.com',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        id: this.raffleDetails.widgetCode,
        type: 'widget',
        refer_source: '',
        entry_source: this.url,
        first_name: this.profile.firstName,
        last_name: this.profile.lastName,
        email: this.profile.email,
        email_again: '',
        [this.raffleDetails.sizeID]: this.size.id,
        agree_to_rules: 'yes',
        'g-recaptcha-response': captchaToken.captchaResponse
      }
    });
  };

  getRafflePage = () => {
    return this.rp.get(this.url);
  };

  makeEntry = async () => {
    this.changeStatus(`Getting Captcha Token`);
    const captchaToken = await this.getCaptcha();
    this.changeStatus(`Submitting Raffle Entry`);
    const submitRaffleResponse = await this.submitRaffle(captchaToken);
    const submitRaffle = JSON.parse(submitRaffleResponse);
    if (submitRaffle.success === 1) {
      this.changeStatus(`Successful Entry`);
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
