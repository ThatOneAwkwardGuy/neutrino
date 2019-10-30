import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

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
    forceUpdate,
    incrementRaffles,
    settings
  ) {
    this.tokenID = uuidv4();
    this.url = url;
    this.settings = settings;
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
    this.incrementRaffles = incrementRaffles;
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

  getFormData = object => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
  };

  submitRaffle = captchaResponse =>
    this.rp({
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
        first_name: this.profile.deliveryFirstName,
        last_name: this.profile.deliveryLastName,
        email: this.profile.email,
        email_again: '',
        [this.raffleDetails.sizeID]: this.size.id,
        agree_to_rules: 'yes',
        'g-recaptcha-response': captchaResponse.captchaToken
      }
    });

  getRafflePage = () => this.rp.get(this.url);

  makeEntry = async () => {
    this.changeStatus(`Getting Captcha Token`);
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: this.cookieJar._jar.store.idx,
      url: `https://app.viralsweep.com/vrlswp/widget/${this.raffleDetails.widgetCode}?framed=1`,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      siteKey: '6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF'
    });
    this.changeStatus(`Submitting Raffle Entry`);
    const submitRaffleResponse = await this.submitRaffle(captchaResponse);
    const submitRaffle = JSON.parse(submitRaffleResponse);
    if (submitRaffle.success === 1) {
      this.changeStatus(`Successful Entry`);
      this.incrementRaffles();
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
