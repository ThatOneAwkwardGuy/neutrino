import { getCaptchaResponse } from '../../../screens/Captcha/functions';
// import { getFormData } from '../../AccountCreator/functions';

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
        console.log(error);
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
      site: this.site
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
      [this.raffleDetails.colorFormID]: this.style.id,
      [this.raffleDetails.sizeFormID]: parseInt(this.size.id, 10),
      'g-recaptcha-response': captchaToken,
      nonce: 'H6yDFGUYUErh£564'
    };
    console.log(payload);

    return this.rp({
      method: 'POST',
      // headers: {
      //   authority: 'doverstreetmarketinternational.formstack.com',
      //   'cache-control': 'max-age=0',
      //   origin: 'https://london.doverstreetmarket.com',
      //   'upgrade-insecure-requests': '1',
      //   'content-type': 'application/x-www-form-urlencoded',
      //   'user-agent':
      //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
      //   accept:
      //     'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      //   referer: this.url,
      //   'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
      //   // accept:
      //   //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      //   // 'accept-language': 'en-US,en;q=0.9',
      //   // 'cache-control': 'no-cache',
      //   // 'content-type': 'application/x-www-form-urlencoded',
      //   // pragma: 'no-cache',
      //   // 'sec-fetch-mode': 'navigate',
      //   // 'sec-fetch-site': 'cross-site',
      //   // 'sec-fetch-user': '?1',
      //   // 'upgrade-insecure-requests': '1',
      //   // referrer: this.url,
      //   // referrerPolicy: 'no-referrer-when-downgrade'
      // },
      url:
        'https://doverstreetmarketinternational.formstack.com/forms/index.php',
      // body: new URLSearchParams(getFormData(payload)).toString()
      form: payload
    });
  };

  makeEntry = async () => {
    // fetch(
    //   'https://doverstreetmarketinternational.formstack.com/forms/index.php',
    //   {
    //     credentials: 'include',
    //     body:
    //       'form=3580197&viewkey=Tlfx7CgsF3&password=&hidden_fields=&incomplete=&incomplete_password=&referrer=https%3A%2F%2Flondon.doverstreetmarket.com%2Fnew-items%2Fnikelab&referrer_type=js&_submit=1&style_version=3&viewparam=766219&field82172077=Moyo+George&field82172078=moyogeorge%40outlook.com&field82172079=07427488747&field82172080=RM17+5BN&field82172081=Summit+White%2FWhite+Wolf&field82172082=10&g-recaptcha-response=03AOLTBLQJ5UMRcKO3AP_P2FEv8odftYKXwh1suDvCS3XpZGSE6eNXLe0hI6yzsLX23GdXXcArTXccfCSFlCbS3RlCu5nPJ0CqKplHzP2XbQ2zMnhyWl_6titRblyGDvGhnHg0trx0Du_FVMiGjPq6Qx_EPVkD6xeJLLa8Cn92c5wBrwFLlS5H6dO33AniEKBvo3ddVuKEvu1pfruKSl_9RLtI2wJlQ-pF73In7_1SjKCgS4HiVlORJE6-6-RsvtNWA7S_jemHZp8xQGJICDxxrpdJewmbkCfHc4nNv53Ul__MokdjAq8Z1rqbDzXERVZA7IcXzokIyu8_sI2m_Tf7Hn6hmvIdX0GjpQK5w9BkH46OPAHqZwn-DcrPRQII_UZCAVwwwmoIT2YzC8tsC9jUPeJ5iQqnnnP7ew&nonce=8o4CrGt565ypDk9Y',
    //     method: 'POST',
    //     mode: 'cors'
    //   }
    // );
    this.changeStatus('Getting Captcha');
    const captchaResponse = await this.getCaptcha();
    console.log(captchaResponse);
    const entryResponse = await this.submitRaffle(captchaResponse.captchaToken);
    console.log(entryResponse);
  };
}
