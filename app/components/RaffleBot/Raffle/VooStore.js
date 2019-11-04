import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const cheerio = require('cheerio');

export default class VooStore {
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
    this.proxy = proxy;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
    this.cookieJar = rp.jar();
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
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

  getFormData = object => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
  };

  submitRaffle = (token, captchaToken) =>
    // const payload = {
    //   token,
    //   page_id: this.raffleDetails.pageID,
    //   shoes_size: this.size.id,
    //   action: 'send_request',
    //   fax: '',
    //   name: this.profile.deliveryFirstName,
    //   lastname: this.profile.deliveryLastName,
    //   email: this.profile.email,
    //   contact_number: this.profile.phone,
    //   streetname: this.profile.deliveryAddress,
    //   housenumber: this.profile.deliveryApt,
    //   postalcode: this.profile.deliveryZip,
    //   city: this.profile.deliveryCity,
    //   country: this.profile.deliveryCountry,
    //   countryhidden: '',
    //   'g-recaptcha-response': captchaToken
    // };
    this.rp({
      method: 'POST',
      uri: 'https://raffle.vooberlin.com/ajax.php',
      headers: {
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        authority: 'raffle.vooberlin.com',
        accept: '*/*',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        origin: 'https://raffle.vooberlin.com',
        'x-requested-with': 'XMLHttpRequest',
        referrer: this.url,
        referrerPolicy: '1no-referrer-when-downgrade'
      },
      resolveWithFullResponse: true,
      body: `token=${token}&page_id=${this.raffleDetails.pageID}&shoes_size=${this.size.id}&action=send_request&fax=&name=${this.profile.deliveryFirstName}&lastname=${this.profile.deliveryLastName}&email=${this.profile.email}&contact_number=${this.profile.phone}&streetname=${this.profile.deliveryAddress}&housenumber=${this.profile.deliveryApt}&postalcode=${this.profile.deliveryZip}&city=${this.profile.deliveryCity}&country=${this.profile.deliveryCountry}&countryhidden=&g-recaptcha-response=${captchaToken}`
    });

  getRafflePageToken = async () => {
    const body = await this.rp.get(this.url);
    const $ = cheerio.load(body);
    const token = $('input[name="token"]').attr('value');
    
    return token;
  };

  makeEntry = async () => {
    this.changeStatus(`Getting Raffle Page`);
    const token = await this.getRafflePageToken();
    this.changeStatus(`Getting Captcha Token`);
    const capthcaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: this.cookieJar._jar.store.idx,
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.site,
      site: this.site,
      settings: this.settings
    });
    this.changeStatus(`Submitting Raffle Entry`);
    const submitRaffleResponse = await this.submitRaffle(
      token,
      capthcaResponse.captchaToken
    );
    
    const submitRaffle = JSON.parse(submitRaffleResponse.body);
    if (submitRaffle.error) {
      throw new Error(submitRaffle.msg);
    } else {
      this.changeStatus(`Raffle Entry Successful`);
      this.incrementRaffles();
    }
  };
}
