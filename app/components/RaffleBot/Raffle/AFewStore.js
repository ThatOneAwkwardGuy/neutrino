import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { ValidateSchema, AFewStoreSchema } from '../schemas';
import { getFormData } from '../../AccountCreator/functions';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

export default class AFewStore {
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

  makeEntry = async () => {
    ValidateSchema(AFewStoreSchema, { ...this.profile });
    this.changeStatus(`Getting Captcha`);
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      siteKey: '6Lexz1YUAAAAAJZknL3EkeY_xBlIKGKGfGwFHhjK'
    });
    this.changeStatus(`Submitting Raffle Entry`);
    const payload = {
      [this.raffleDetails.honeypotFieldName]: '',
      EMAIL: this.profile.email,
      FNAME: this.profile.deliveryFirstName,
      LNAME: this.profile.deliveryLastName,
      STREET: this.profile.deliveryAddress,
      ZIP: this.profile.deliveryZip,
      STATE: this.profile.deliveryRegion,
      CITY: this.profile.deliveryCity,
      INSTAGRAM: this.profile.instagram,
      SIZES: this.size.id,
      COUNTRY: this.profile.deliveryCountry,
      'g-recaptcha-response': captchaResponse.captchaToken,
      'gdpr[287]': 'on',
      c: 'dojo_request_script_callbacks.dojo_request_script2'
    };
    const queryString = new URLSearchParams(getFormData(payload)).toString();
    console.log(queryString);
    const response = await this.rp({
      method: 'GET',
      uri: `https:${this.raffleDetails.subscribeUrl}&${queryString}`,
      resolveWithFullResponse: true,
      followAllRedirects: true
    });
    if (response.body.includes('"result":"success"')) {
      this.changeStatus('Successful Entry');
    } else {
      throw new Error(response.body);
    }
  };
}
