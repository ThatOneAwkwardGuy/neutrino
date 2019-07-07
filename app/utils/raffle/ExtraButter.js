import { BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, OPEN_CAPTCHA_WINDOW, RECEIVE_CAPTCHA_TOKEN, FINISH_SENDING_CAPTCHA_TOKEN } from '../constants';
const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
const ipcRenderer = require('electron').ipcRenderer;

export default class ExtraButter {
  constructor(url, profile, site, style, size, status, proxy, raffleDetails, forceUpdate) {
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
    this.rp = rp.defaults({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
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

  getIDForSize = async () => {
    const raffleInfoResponse = await this.rp.get(`https://eb-draw.herokuapp.com/draws/${this.raffleDetails.product.product.id}`);
    const raffleInfo = JSON.parse(raffleInfoResponse);
    const variant = raffleInfo[0].variants.find(variant => String(variant.variant_id) === String(this.size.id));
    console.log(raffleInfo);
    console.log(variant);
    if (variant) {
      return variant;
    } else {
      throw new Error('Unable To Find ID For Size');
    }
  };

  createCustomer = () => {
    return this.rp({
      method: 'POST',
      uri: 'https://eb-draw.herokuapp.com/customers/new',
      form: {
        first_name: this.profile.firstName,
        last_name: this.profile.lastName,
        email: this.profile.email
      }
    });
  };

  submitRaffle = (variant, customerID) => {
    return this.rp({
      method: 'POST',
      uri: 'https://eb-draw.herokuapp.com/draws/entries/new',
      form: {
        shipping_first_name: this.profile.firstName,
        shipping_last_name: this.profile.lastName,
        customer_id: customerID,
        variant_id: variant.id,
        street_address: this.profile.address.address1,
        city: this.profile.address.city,
        zip: this.profile.address.zipCode,
        state: this.profile.address.state,
        phone: this.profile.address.address1,
        country: this.profile.phoneNumber,
        delivery_method: 'online'
      }
    });
  };

  tokenizeCard = () => {
    return this.rp({
      url: 'https://api.stripe.com/v1/tokens',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Referer: 'https://js.stripe.com/v3/controller-97af8c3dcbdd82cb2827d49bb8aa31ad.html',
        Origin: 'https://js.stripe.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        key: 'pk_test_qM41LJ9RZgw63yIlLC1PDkTL',
        'card[number]': this.profile.paymentDetails.cardNumber,
        'card[cvc]': this.profile.paymentDetails.cvv,
        'card[exp_month]': this.profile.paymentDetails.expirationMonth,
        'card[exp_year]': this.profile.paymentDetails.expirationYear.slice(-2),
        payment_user_agent: 'stripe.js/15af90e0; stripe-js-v3/15af90e0',
        referrer: this.url
      }
    });
  };

  completeRaffle = (entry, token) => {
    return this.rp({
      method: 'POST',
      url: 'https://eb-draw.herokuapp.com/draws/entries/checkout',
      method: 'POST',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Referer: this.url,
        Origin: 'https://shop.extrabutterny.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      form: {
        checkout_token: token,
        entry_id: entry
      }
    });
  };

  checkEmail = async () => {
    const captchaToken = await this.getCaptcha();
    try {
      const validationEmailResponse = await this.rp({
        method: 'POST',
        url: 'https://eb-draw.herokuapp.com/customers/validateEmail',
        method: 'POST',
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: this.url,
          Origin: 'https://shop.extrabutterny.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        form: {
          email: this.profile.email,
          product_id: this.raffleDetails.product.product.id,
          challenge_response: captchaToken.captchaResponse
        }
      });
      const JSONparsed = JSON.parse(validationEmailResponse);
      return JSONparsed.customers[0];
    } catch (error) {
      return false;
    }
  };

  getCaptcha = () => {
    return new Promise((resolve, reject) => {
      try {
        const tokenID = uuidv4();
        ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
        ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
          checkoutURL: this.url,
          id: tokenID,
          type: 'ExtraButter',
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
    const submitRaffleResponse = await this.submitRaffle(variant, createCustomer.id);
    const submitRaffle = JSON.parse(submitRaffleResponse);
    console.log(submitRaffle);
    this.changeStatus('Submitting Card Info');
    const tokenizeCardResponse = await this.tokenizeCard();
    const tokenizeCard = JSON.parse(tokenizeCardResponse);
    console.log(tokenizeCard);
    this.changeStatus('Submitting Raffle Entry');
    const completeRaffleResponse = await this.completeRaffle(submitRaffle.id, tokenizeCard.id);
    console.log(completeRaffleResponse);
    this.changeStatus('Completed Entry');
  };
}
