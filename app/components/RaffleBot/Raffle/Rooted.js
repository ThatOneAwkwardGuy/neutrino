import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { getFormData } from '../../AccountCreator/functions';
import { longToShortStates } from '../../../constants/constants';
import { ValidateSchema, RootedSchema } from '../schemas';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
const HttpsProxyAgent = require('https-proxy-agent');
const cheerio = require('cheerio');

export default class Rooted {
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
        if (
          error &&
          error.options &&
          error.options.url === 'https://api.stripe.com/v1/tokens'
        ) {
          const parsedError = JSON.parse(error.error);

          this.changeStatus(
            `Error Submitting Raffle - ${parsedError.error.message}`
          );
        } else if (error.statusCode === 400) {
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

  getIDForSize = async () => {
    const raffleInfoResponse = await this.rp({
      method: 'GET',
      uri: `https://rooted-draw.herokuapp.com/draws/${this.raffleDetails.product.product.id}`
    });
    const raffleInfo = JSON.parse(raffleInfoResponse);
    const variant = raffleInfo[0].variants.find(
      variantOpt => String(variantOpt.variant_id) === String(this.size.id)
    );
    if (variant) {
      return variant;
    }
    throw new Error('Unable To Find ID For Size');
  };

  createCustomer = () =>
    this.rp({
      method: 'POST',
      uri: 'https://rooted-draw.herokuapp.com/customers/new',
      form: {
        first_name: this.profile.deliveryFirstName,
        last_name: this.profile.deliveryLastName,
        email: this.profile.email
      }
    });

  submitRaffle = (variant, customerID) => {
    const payload = {
      shipping_first_name: this.profile.deliveryFirstName,
      shipping_last_name: this.profile.deliveryLastName,
      customer_id: customerID,
      variant_id: variant.id,
      street_address: this.profile.deliveryAddress,
      city: this.profile.deliveryCity,
      zip: this.profile.deliveryZip,
      state:
        longToShortStates[this.profile.deliveryRegion] !== undefined
          ? longToShortStates[this.profile.deliveryRegion]
          : 'none',
      phone:
        this.profile.phone !== undefined ? this.profile.phone : '12345678910',
      country: this.profile.deliveryCountry,
      delivery_method: 'online'
    };
    const queryString = new URLSearchParams(getFormData(payload)).toString();
    return this.rp({
      method: 'POST',
      uri: 'https://rooted-draw.herokuapp.com/draws/entries/new',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'sec-fetch-mode': 'cors',
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      body: queryString
    });
  };

  tokenizeCard = () =>
    this.rp({
      url: 'https://api.stripe.com/v1/tokens',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Referer:
          'https://js.stripe.com/v3/controller-d223d770b0acbba9ec5ac4658b071b18.html',
        Origin: 'https://js.stripe.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        key: 'pk_live_kmvTN83byZVFybffnFmaNfGr',
        'card[number]': this.profile.card.cardNumber,
        'card[cvc]': this.profile.card.cvv,
        'card[exp_month]': this.profile.card.expMonth,
        'card[exp_year]': this.profile.card.expYear.slice(-2),
        payment_user_agent: 'stripe.js/901bf2cc; stripe-js-v3/901bf2cc',
        referrer: `${this.url}&step=size`
      }
    });

  completeRaffle = (entry, token) =>
    this.rp({
      method: 'POST',
      url: 'https://rooted-draw.herokuapp.com/draws/entries/checkout',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Referer: this.url,
        Origin: 'https://stay-rooted.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      form: {
        checkout_token: token,
        entry_id: entry
      }
    });

  checkEmail = async () => {
    this.changeStatus('Getting Captcha');
    await this.rp.get(this.url);
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      siteKey: '6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF'
    });
    const payload = {
      email: this.profile.email,
      product_id: this.raffleDetails.product.product.id,
      challenge_response: captchaResponse.captchaToken
    };
    const queryString = new URLSearchParams(getFormData(payload)).toString();
    const validationEmailResponse = await this.rp({
      method: 'POST',
      url: 'https://rooted-draw.herokuapp.com/customers/validateEmail',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        referrer: this.url,
        Origin: 'https://stay-rooted.com',
        'sec-fetch-mode': 'cors',
        referrerPolicy: 'no-referrer-when-downgrade',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: queryString
    });
    const JSONparsed = JSON.parse(validationEmailResponse);
    return JSONparsed.customers[0];
  };

  login = async (email, pass) => {
    const { settings } = this;
    this.changeStatus('Logging In');
    const loginResponse = await this.rp({
      method: 'POST',
      url: 'https://stay-rooted.com/account/login',
      headers: {
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Referer: 'https://stay-rooted.com/account/login',
        Origin: 'https://stay-rooted.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      resolveWithFullResponse: true,
      followRedirect: true,
      followAllRedirects: true,
      form: {
        form_type: 'customer_login',
        utf8: '✓',
        'customer[email]': email,
        'customer[password]': pass
      }
    });
    if (loginResponse.body.includes('<title>Challenge</title>')) {
      const captchaResponse = await getCaptchaResponse({
        // eslint-disable-next-line no-underscore-dangle
        cookiesObject: this.cookieJar._jar.store.idx,
        url: loginResponse.request.href,
        id: this.tokenID,
        proxy: this.proxy,
        baseURL: this.url,
        site: this.site,
        settings: this.settings,
        siteKey: '6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF'
      });
      let authToken;
      if (settings.CaptchaAPI !== '') {
        const $ = cheerio.load(loginResponse.body);
        authToken = $('input[name="authenticity_token"]').attr('value');
      }
      await this.rp({
        method: 'POST',
        url: 'https://stay-rooted.com/account/login',
        headers: {
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
          pragma: 'no-cache',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: 'https://stay-rooted.com/account/login',
          Origin: 'https://stay-rooted.com',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        followRedirect: true,
        followAllRedirects: true,
        form: {
          authenticity_token:
            settings.CaptchaAPI !== '' ? authToken : captchaResponse.authToken,
          'g-recaptcha-response': captchaResponse.captchaToken
        }
      });
    }
  };

  getCustomerID = async () => {
    const body = await this.rp.get(this.url);
    console.log(body);
    const regex = /(?:"|')(customerId)(?:"|')(?=:)(?::\s*)(?:"|')?(?<value>true|false|[0-9a-zA-Z+\-.$]*)/g;
    const customerId = regex.exec(body);
    if (customerId !== null && customerId.length === 3) {
      return customerId[2];
    }
    throw new Error('Unable to find Customer ID (Cant Find Account)');
  };

  makeEntry = async () => {
    ValidateSchema(RootedSchema, { ...this.profile });

    this.changeStatus('Getting Variant ID For Size');
    const variant = await this.getIDForSize();
    await this.login(this.profile.email, this.profile.password);
    const customerId = await this.getCustomerID();

    this.changeStatus('Submitting Card Info');
    const tokenizeCardResponse = await this.tokenizeCard();
    const tokenizeCard = JSON.parse(tokenizeCardResponse);

    this.changeStatus('Submitting Raffle Info');
    const submitRaffleResponse = await this.submitRaffle(variant, customerId);
    const submitRaffle = JSON.parse(submitRaffleResponse);

    this.changeStatus('Submitting Raffle Entry');
    await this.completeRaffle(submitRaffle.id, tokenizeCard.id);

    this.changeStatus('Completed Entry');
    this.incrementRaffles({
      url: this.url,
      site: this.site,
      size: this.size ? this.size.name : '',
      style: this.style ? this.style.name : ''
    });
  };
}
