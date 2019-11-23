// import { ValidateSchema, FootpatrolSchema } from '../schemas';
import { longToShortCountries } from '../../../constants/constants';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
const HttpsProxyAgent = require('https-proxy-agent');

export default class Footpatrol {
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
      agent: proxy !== '' ? new HttpsProxyAgent(proxy) : null,
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

  submitEntry = async captchaResponse => {
    const payload = {
      address1: this.profile.deliveryAddress,
      address2: '',
      city: this.profile.deliveryCity,
      country:
        longToShortCountries[this.profile.deliveryCountry] !== undefined
          ? longToShortCountries[this.profile.deliveryCountry]
          : '',
      county: this.profile.deliveryRegion,
      dateofBirth: '13/02/1996',
      email: this.profile.email,
      email_optin: 1,
      firstName: this.profile.deliveryFirstName,
      hostname: 'https://raffles.footpatrol.com',
      lastName: this.profile.deliveryLastName,
      mobile: this.profile.phone,
      paypalEmail: this.profile.email,
      postCode: this.profile.deliveryZip,
      rafflesID: this.raffleDetails.rafflesId,
      shoeSize: this.size.id,
      sms_optin: 1,
      token: captchaResponse.captchaToken
    };
    console.log(payload);
    try {
      const response = await this.rp({
        method: 'POST',
        headers: {
          accept: 'text/plain, */*; q=0.01',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          pragma: 'no-cache',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          referrer: this.url,
          referrerPolicy: 'no-referrer-when-downgrade'
        },
        uri:
          'https://rq06iiykwb.execute-api.eu-west-1.amazonaws.com/entries/prod',
        body: payload,
        json: true
      });
      return response;
    } catch (e) {
      return e.error;
    }
  };

  makeEntry = async () => {
    // ValidateSchema(FootpatrolSchema, { ...this.profile });
    this.changeStatus('Getting Captcha Token');
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url:
        'https://www.google.com/recaptcha/api2/anchor?ar=1&k=6LfIUL8UAAAAAMvYieKAMgh4e9qQFpLiLdqLLJG4&co=aHR0cHM6Ly9yYWZmbGVzLmZvb3RwYXRyb2wuY29tOjQ0Mw..&hl=en&v=75nbHAdFrusJCwoMVGTXoHoM&size=invisible&cb=wl7ulm6un9ab',
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      windowCookies: this.raffleDetails.windowCookies,
      siteKey: '6LfIUL8UAAAAAMvYieKAMgh4e9qQFpLiLdqLLJG4'
    });
    this.changeStatus('Submitting Raffle Entry');
    const entryResponse = await this.submitEntry(captchaResponse);
    console.log(entryResponse);
    if (entryResponse.success) {
      this.changeStatus('Successful Entry');
      this.incrementRaffles({
        url: this.url,
        site: this.site,
        size: this.size ? this.size.name : '',
        style: this.style ? this.style.name : ''
      });;
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
