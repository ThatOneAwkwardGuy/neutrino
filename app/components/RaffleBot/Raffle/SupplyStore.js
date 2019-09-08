import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { getFormData } from '../../AccountCreator/functions';
import Countries from '../../../constants/countries';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');
const cheerio = require('cheerio');

export default class SupplyStore {
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
      // headers: {
      //   'User-Agent':
      //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
      // },
      proxy: proxy !== '' ? proxy : null,
      jar: this.cookieJar
    });
  }

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  start = async () => {
    // fetch('https://createsend.com//t/getsecuresubscribelink', {
    //   credentials: 'omit',

    //   body:
    //     'email=fsdfs%40sdfsd.com&data=5B5E7037DA78A748374AD499497E309E76065A56EDF11401206037EB8C8D0C4AFEEA40D4455F63812EB8906AF23021FF066F5779468274EC899D0C1A4C4DD37E',
    //   method: 'POST',
    //   mode: 'cors'
    // });
    console.log(this.proxy);
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.log(error);
        if (error.statusCode === 400) {
          this.changeStatus(`Try Again`);
        } else {
          this.changeStatus(`Error Submitting Raffle - ${error.message}`);
        }
      }
      this.run = false;
    }
  };

  getSubscribeLink = () => {
    const payload = {
      email: this.profile.email,
      data: this.raffleDetails.raffleId
    };
    return this.rp({
      method: 'POST',
      uri: 'https://createsend.com//t/getsecuresubscribelink',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'sec-fetch-mode': 'cors',
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      body: new URLSearchParams(getFormData(payload)).toString()
    });
  };

  submitRaffle = (subscribeLink, captchaToken) => {
    const regionIds = {
      ACT: '14234908',
      NSW: '14234909',
      NT: '14234910',
      QLD: '14234911',
      ASA: '14234912',
      TAS: '14234913',
      VIC: '14234914',
      WA: '14234915'
    };
    const payload = {
      [this.raffleDetails['First Name']]: this.profile.deliveryFirstName,
      [this.raffleDetails['Last Name']]: this.profile.deliveryLastName,
      [this.raffleDetails['Phone Number']]: this.profile.phone,
      [this.raffleDetails.Email]: this.profile.email,
      [this.raffleDetails.Size]: this.size.id,
      [this.raffleDetails.Street]: this.profile.deliveryAddress,
      [this.raffleDetails['Suburb/Town']]: this.profile.deliveryCity,
      [this.raffleDetails.State]:
        Countries[this.profile.deliveryCountry].province_codes[
          this.profile.deliveryRegion
        ] !== undefined
          ? regionIds[
              Countries[this.profile.deliveryCountry].province_codes[
                this.profile.deliveryRegion
              ]
            ]
          : '',
      [this.raffleDetails.Country]: this.profile.deliveryCountry,
      [this.raffleDetails['Post Code']]: this.profile.deliveryZip,
      'cm-privacy-consent': 'on',
      'cm-privacy-consent-hidden': 'true',
      'cm-privacy-email': 'on',
      'cm-privacy-email-hidden': 'true',
      terms: 'Yes',
      'cm-f-djihluid': 'Yes'
    };
    console.log(payload);
    return this.rp({
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      method: 'POST',
      resolveWithFullResponse: true,
      uri: subscribeLink,
      body: `${new URLSearchParams(
        getFormData(payload)
      ).toString()}&terms=Yes&${new URLSearchParams(
        getFormData({ 'g-recaptcha-response': captchaToken })
      ).toString()}`
    });
  };

  confirmEmail = (body, subscribeLink, captchaToken) => {
    const $ = cheerio.load(body);
    const guid = $('input[name="guid"]').attr('value');
    return this.rp({
      method: 'POST',
      url: 'https://www.createsend.com/t/processrecaptcha',
      headers: {
        authority: 'www.createsend.com',
        'cache-control': 'max-age=0',
        origin: 'https://www.createsend.com',
        'upgrade-insecure-requests': '1',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        referer: subscribeLink,
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
      },
      body: new URLSearchParams(
        getFormData({
          guid,
          'g-recaptcha-response': captchaToken
        })
      ).toString()
    });
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
    ipcRenderer.send(STOP_CAPTCHA_JOB, this.tokenID);
  };

  makeEntry = async () => {
    // fetch('https://createsend.com//t/getsecuresubscribelink', {
    //   credentials: 'omit',
    //   headers: {
    //     'content-type': 'application/x-www-form-urlencoded',
    //     'sec-fetch-mode': 'cors'
    //   },
    //   referrer:
    //     'https://www.supplystore.com.au/raffle-nikelab-ld-waffle-x-sacai-pine-greenclay-orange-del-sol-sail.aspx',
    //   referrerPolicy: 'no-referrer-when-downgrade',
    //   body:
    //     'email=fsdfs%40sdfsd.com&data=5B5E7037DA78A748374AD499497E309E76065A56EDF11401206037EB8C8D0C4AFEEA40D4455F63812EB8906AF23021FF066F5779468274EC899D0C1A4C4DD37E',
    //   method: 'POST',
    //   mode: 'cors'
    // });
    this.changeStatus('Getting Link');
    const subscribeLink = await this.getSubscribeLink();
    console.log(subscribeLink);
    this.changeStatus('Getting Captcha');
    const captchaResponse = await getCaptchaResponse({
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site
    });
    this.changeStatus('Making Entry');
    const submissionResponse = await this.submitRaffle(
      subscribeLink,
      captchaResponse.captchaToken
    );
    console.log(submissionResponse);
    // const captchaResponse2 = await getCaptchaResponse({
    //   cookiesObject: {},
    //   url: this.url,
    //   id: this.tokenID,
    //   proxy: this.proxy,
    //   baseURL: this.url,
    //   site: this.site
    // });
    // this.changeStatus('Making Entry');
    // this.changeStatus('Confirming EMail');
    // const emailConfirmation = await this.confirmEmail(
    //   submissionResponse.body,
    //   subscribeLink,
    //   captchaResponse2.captchaToken
    // );
    // console.log(emailConfirmation);
  };
}
