import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { longToShortCountries } from '../../../constants/constants';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class BSTN {
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
    this.url = url;
    this.tokenID = uuidv4();
    this.proxy = proxy;
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

  getCaptcha = () =>
    // fetch('https://raffle.bstn.com/api/register', {
    //   credentials: 'include',
    //   headers: {
    //     accept: 'application/json, text/plain, */*',
    //     'accept-language': 'en-US,en;q=0.9',
    //     'cache-control': 'no-cache',
    //     'content-type': 'application/json;charset=UTF-8',
    //     pragma: 'no-cache',
    //     'sec-fetch-mode': 'cors',
    //     'sec-fetch-site': 'same-origin'
    //   },
    //   referrer: 'https://raffle.bstn.com/air-jordan-1-retro-high-og-obsidian-',
    //   referrerPolicy: 'no-referrer-when-downgrade',
    //   body:
    //     '{"additional":{"instagram":"Testing"},"title":"male","email":"moyogeorge@outlook.com","firstName":"Moyo","lastName":"George","street":"44 Brooke Road","streetno":"44","address2":"","zip":"RM17 5BN","city":"Grays","country":"DE","acceptedPrivacy":true,"newsletter":false,"recaptchaToken":"03AOLTBLRXbZQWP6KpSqtpZuv6zkSOSvrBp5uMMoNP7CfzxBrAs9-rncLFxtf1Vv52uwflaJ6M9PSRHaCdYnMaY4tmrpBNlDFY8gbiXJSlqn1HFLILXqgr4RKk7wug2lpGkCTGz_bC60_yZu9d1hEuNxldCuahYsvNeOA1535o_6w49L6x7dYNtVtsoKGGjPVM5jDS8PKo__n_yNtZzG7vWHi1URjr8oiGRlmFEi10iOcxoTh98rk8pPRIvvQVfw4qCH9DqHLgjyTzDJtwT1Zqeg6vssi_aJ8OUZJaMAnV7hqMcwqb5VL6rvAySbql9CB_SaOxsVVVPL9b","raffle":{"raffleId":"air-jordan-1-retro-high-og-obsidian-","parentIndex":0,"option":"41"},"issuerId":"raffle.bstn.com"}',
    //   method: 'POST',
    //   mode: 'cors'
    // });
    getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site
    });

  getCookies = () =>
    this.rp.get(
      'https://raffle.bstn.com/cdn-cgi/l/chk_jschl?s=5bd87c99e3b7b7785c192075a7909b681a70a566-1567105493-1800-ARY2nmSO0VyWacP5czAnXOAg%2BFja%2Bq3rUYCUaGwlsA7WXdt2qxrZo1DOrZgbet5YJt9GfPsV7LTnUnvfhHqR0TR4np8l3U%2F3ZLLCTJx%2BD7lYLHlszSRzU9Eh4xIQIRXQQ91vNy%2FjkYLEUBqIsSh4gJ0GMXq8fL%2BxRjSsA00hmX%2Fq&jschl_vc=3ccb50c75b74ea8dc4841d743bb52e5b&pass=1567105497.575-l6XjIkFQbp&jschl_answer=18.2511758326'
    );

  submitRaffle = (captchaToken, cookies) =>
    this.rp({
      method: 'POST',
      uri: 'https://raffle.bstn.com/api/register',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json;charset=UTF-8',
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade',
        cookies
      },
      body: JSON.stringify({
        additional: {
          instagram:
            this.profile.instagram !== undefined ? this.profile.instagram : ''
        },
        title: 'other',
        email: this.profile.email,
        firstName: this.profile.deliveryFirstName,
        lastName: this.profile.deliveryLastName,
        street: this.profile.deliveryAddress,
        streetno: this.profile.deliveryApt,
        address2: '',
        zip: this.profile.deliveryZip,
        city: this.profile.deliveryCity,
        country:
          longToShortCountries[this.profile.deliveryCountry] !== undefined
            ? longToShortCountries[this.profile.deliveryCountry]
            : '',
        acceptedPrivacy: true,
        newsletter: false,
        recaptchaToken: captchaToken,
        raffle: {
          raffleId: this.url.split('/').slice(-1)[0],
          parentIndex: 0,
          option: this.size.id
        },
        issuerId: 'raffle.bstn.com'
      }),
      resolveWithFullResponse: true
    });

  makeEntry = async () => {
    this.changeStatus('Getting Captcha');
    const captchaResponse = await this.getCaptcha();
    console.log(captchaResponse);
    await this.getCookies();
    this.changeStatus('Submitting Raffle Entry');
    const raffleResponse = await this.submitRaffle(
      captchaResponse.captchaToken,
      captchaResponse.cookies
    );
    console.log(raffleResponse);
    // if (!raffleResponse.body.includes('"result":"success"')) {
    //   throw new Error('Failed To Enter Raffle');
    // }
    this.changeStatus('Completed Entry');
    this.incrementRaffles();
  };
}
