import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class ExtraButter {
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

  getIDForSize = async () => {
    const raffleInfoResponse = await this.rp({
      method: 'GET',
      uri: `https://eb-draw.herokuapp.com/draws/${this.raffleDetails.product.product.id}`
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
      uri: 'https://eb-draw.herokuapp.com/customers/new',
      form: {
        first_name: this.profile.firstName,
        last_name: this.profile.lastName,
        email: this.profile.email
      }
    });

  submitRaffle = (variant, customerID) =>
    this.rp({
      method: 'POST',
      uri: 'https://eb-draw.herokuapp.com/draws/entries/new',
      form: {
        shipping_first_name: this.profile.firstName,
        shipping_last_name: this.profile.lastName,
        customer_id: customerID,
        variant_id: variant.id,
        street_address: this.profile.address.address,
        city: this.profile.address.city,
        zip: this.profile.address.zipCode,
        state: this.profile.address.state,
        phone: this.profile.phoneNumber,
        country: this.profile.address.region,
        delivery_method: 'online'
      }
    });

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
        key: 'pk_live_u42h9k3kHDcKpj3DjgyIXjc7',
        'card[number]': this.profile.paymentDetails.cardNumber,
        'card[cvc]': this.profile.paymentDetails.cvv,
        'card[exp_month]': this.profile.paymentDetails.expirationMonth,
        'card[exp_year]': this.profile.paymentDetails.expirationYear.slice(-2),
        payment_user_agent: 'stripe.js/901bf2cc; stripe-js-v3/901bf2cc',
        referrer: `${this.url}&step=size`
      }
    });

  completeRaffle = (entry, token) =>
    this.rp({
      method: 'POST',
      url: 'https://eb-draw.herokuapp.com/draws/entries/checkout',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Referer: this.url,
        Origin: 'https://shop.extrabutterny.com',
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
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: this.cookieJar._jar.store.idx,
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site
    });
    try {
      const validationEmailResponse = await this.rp({
        method: 'POST',
        url: 'https://eb-draw.herokuapp.com/customers/validateEmail',
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: this.url,
          Origin: 'https://shop.extrabutterny.com',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        form: {
          email: this.profile.email,
          product_id: this.raffleDetails.product.product.id,
          challenge_response: captchaResponse.captchaToken
        }
      });
      const JSONparsed = JSON.parse(validationEmailResponse);
      return JSONparsed.customers[0];
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  makeEntry = async () => {
    this.changeStatus('Getting Variant ID For Size');
    const variant = await this.getIDForSize();
    console.log(variant);
    this.changeStatus('Checking Email');
    const checkEmailResponse = await this.checkEmail();
    let createCustomer;
    if (!checkEmailResponse) {
      console.log(checkEmailResponse);
      this.changeStatus('Creating Customer');
      const createCustomerResponse = await this.createCustomer();
      createCustomer = JSON.parse(createCustomerResponse);
    } else {
      createCustomer = checkEmailResponse;
    }
    console.log(createCustomer);
    this.changeStatus('Submitting Raffle Info');
    const submitRaffleResponse = await this.submitRaffle(
      variant,
      createCustomer.id
    );
    const submitRaffle = JSON.parse(submitRaffleResponse);
    console.log(submitRaffle);
    this.changeStatus('Submitting Card Info');
    const tokenizeCardResponse = await this.tokenizeCard();
    const tokenizeCard = JSON.parse(tokenizeCardResponse);
    console.log(tokenizeCard);
    this.changeStatus('Submitting Raffle Entry');
    const completeRaffleResponse = await this.completeRaffle(
      submitRaffle.id,
      tokenizeCard.id
    );
    console.log(completeRaffleResponse);
    this.changeStatus('Completed Entry');
    this.incrementRaffles();
  };
}
