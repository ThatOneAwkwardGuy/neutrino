import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { longToShortCountries } from '../../../constants/constants';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
// const tough = require('tough-cookie');
const cheerio = require('cheerio');
const HttpsProxyAgent = require('https-proxy-agent');

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
    incrementRaffles,
    settings
  ) {
    this.url = url;
    this.tokenID = uuidv4();
    this.proxy = proxy;
    this.settings = settings;
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

  // getCookies = () =>
  //   this.rp.get(
  //     'https://raffle.bstn.com/cdn-cgi/l/chk_jschl?s=5bd87c99e3b7b7785c192075a7909b681a70a566-1567105493-1800-ARY2nmSO0VyWacP5czAnXOAg%2BFja%2Bq3rUYCUaGwlsA7WXdt2qxrZo1DOrZgbet5YJt9GfPsV7LTnUnvfhHqR0TR4np8l3U%2F3ZLLCTJx%2BD7lYLHlszSRzU9Eh4xIQIRXQQ91vNy%2FjkYLEUBqIsSh4gJ0GMXq8fL%2BxRjSsA00hmX%2Fq&jschl_vc=3ccb50c75b74ea8dc4841d743bb52e5b&pass=1567105497.575-l6XjIkFQbp&jschl_answer=18.2511758326'
  //   );

  getPast403 = async () => {
    console.log('working');
    try {
      const response = await this.rp({
        method: 'GET',
        uri: 'http://raffle.bstn.com'
      });
      console.log(response);
    } catch (error) {
      console.log(error);
      const response403 = error.response.body;
      const $ = cheerio.load(response403);
      const s = $('input[name="s"]').attr('value');
      const id = $('script[data-type="normal"]').attr('data-ray');
      const captchaResponse = await getCaptchaResponse({
        // eslint-disable-next-line no-underscore-dangle
        cookiesObject: {},
        url: this.url,
        id: this.tokenID,
        proxy: this.proxy,
        baseURL: this.url,
        site: this.site,
        settings: this.settings,
        windowCookies: this.raffleDetails.windowCookies,
        siteKey: '6LeZJZEUAAAAAPLuYfMYiMOF7X7tKMz45xfEIXaZ'
      });
      try {
        const getResponse = await this.rp({
          method: 'GET',
          uri: `https://raffle.bstn.com/cdn-cgi/l/chk_captcha?s=${s}&id=${id}&g-recaptcha-response=${captchaResponse.captchaToken}`,
          headers: {
            authority: 'raffle.bstn.com',
            pragma: 'no-cache',
            'cache-control': 'no-cache',
            'upgrade-insecure-requests': '1',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'sec-fetch-site': 'same-origin',
            referer: this.url,
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            cookie:
              '__cfduid=de077d1746464eca162de2e7d075752f21573344995; __cf_bm=347fde8238ad1dca205af5664a335e7af3004c8d-1573344995-1800-AYJFyCvcEYstVf/62BG4/8yZs1n22i1yRtoXSgHG+jRkZmuDdOgjogsJ5yRehvPxZZHXAW7aQJoJc61I/DTe0hE=; _gcl_au=1.1.579628416.1573344996; _ga=GA1.2.432967456.1573344996; _gid=GA1.2.675703862.1573344996; _gat_UA-43773101-5=1'
          }
        });

        console.log(getResponse);
      } catch (error2) {
        console.log(error2);
      }
    }
  };

  submitRaffle = (captchaToken, cookies) =>
    this.rp({
      method: 'POST',
      uri: 'http://raffle.bstn.com/api/register',
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
        cookies: cookies
          .map(cookie => `${cookie.name}=${cookie.value}`)
          .join(';')
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
    await this.getPast403();
    // const captchaResponse = await getCaptchaResponse({
    //   // eslint-disable-next-line no-underscore-dangle
    //   cookiesObject: {},
    //   url: this.url,
    //   id: this.tokenID,
    //   proxy: this.proxy,
    //   baseURL: this.url,
    //   site: this.site,
    //   settings: this.settings,
    //   windowCookies: this.raffleDetails.windowCookies,
    //   siteKey: '6LeZJZEUAAAAAPLuYfMYiMOF7X7tKMz45xfEIXaZ'
    // });

    // this.raffleDetails.windowCookies.forEach(cookie => {
    //   const toughCookie = new tough.Cookie({
    //     key: cookie.name,
    //     value: cookie.value,
    //     domain: cookie.domain,
    //     httpOnly: cookie.httpOnly,
    //     hostOnly: cookie.hostOnly,
    //     path: cookie.path
    //   });
    //   this.cookieJar.setCookie(toughCookie.toString(), this.url);
    // });

    // console.log(captchaResponse);

    // // await this.getCookies();
    // this.changeStatus('Submitting Raffle Entry');
    // const raffleResponse = await this.submitRaffle(
    //   captchaResponse.captchaToken,
    //   this.raffleDetails.windowCookies
    // );

    // console.log(raffleResponse);

    // // if (!raffleResponse.body.includes('"result":"success"')) {
    // //   throw new Error('Failed To Enter Raffle');
    // // }
    // this.changeStatus('Completed Entry');
    // this.incrementRaffles();
  };
}
