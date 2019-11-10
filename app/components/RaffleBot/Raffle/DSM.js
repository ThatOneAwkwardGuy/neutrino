import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { ValidateSchema, DSMSchema } from '../schemas';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class DSM {
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
      proxy,
      jar: this.cookieJar
    });
  }

  start = async () => {
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.error(error);
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  getCaptcha = () =>
    getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings
    });

  submitRaffle = captchaToken => {
    const payload = {
      form: parseInt(this.raffleDetails.form, 10),
      viewkey: this.raffleDetails.viewkey,
      password: '',
      hidden_fields: '',
      incomplete: '',
      incomplete_password: '',
      referrer: this.url,
      referrer_type: 'js',
      // eslint-disable-next-line no-underscore-dangle
      _submit: 1,
      style_version: 3,
      viewparam: parseInt(this.raffleDetails.viewparam, 10),
      [this.raffleDetails
        .fullNameFormID]: `${this.profile.deliveryFirstName} ${this.profile.deliveryLastName}`,
      [this.raffleDetails.phoneFormID]: this.profile.phone,
      [this.raffleDetails.emailFormID]: this.profile.email,
      [this.raffleDetails.postcodeFormID]: this.profile.deliveryZip,
      [this.raffleDetails.sizeFormID]: parseInt(this.size.id, 10),
      'g-recaptcha-response': captchaToken
    };
    if (this.style) {
      payload[this.raffleDetails.colorFormID] = this.style.id;
    }

    return this.rp({
      method: 'POST',
      followAllRedirects: true,
      resolveWithFullResponse: true,
      url:
        'https://doverstreetmarketinternational.formstack.com/forms/index.php',
      form: payload
    });
  };

  makeEntry = async () => {
    ValidateSchema(DSMSchema, this.profile);

    this.changeStatus('Getting Captcha');
    const captchaResponse = await this.getCaptcha();
    try {
      const entryResponse = await this.submitRaffle(
        captchaResponse.captchaToken
      );
      if (
        entryResponse.body.toLowerCase().includes('<title>thank you</title>')
      ) {
        this.changeStatus('Successful Entry');
      }
    } catch (error) {
      console.error(error);
      if (
        error.message.includes(
          'Each submission must have unique values for the following fields'
        )
      ) {
        this.changeStatus('Email already entered');
      } else {
        this.changeStatus('Error');
      }
    }
  };
}
