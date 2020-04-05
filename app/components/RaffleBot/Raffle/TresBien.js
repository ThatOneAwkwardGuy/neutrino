import { ValidateSchema, ENDSchema } from '../schemas';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';

const rp = require('request-promise');
const cheerio = require('cheerio');

export default class TresBien {
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
    this.profile = profile;
    this.run = false;
    this.settings = settings;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
    this.cookieJar = rp.jar();
    this.rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
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
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.error(error);
        this.changeStatus(`Error Submitting Raffle - ${error.message}`);
      }
      this.run = false;
    }
  };

  submitEntry = async () => {
    this.changeStatus('Getting Captcha');
    const captchaResponse = await getCaptchaResponse({
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      siteKey: '6LfjzmQUAAAAAJxTOcx3vYq3hroeYczGfDPU-NlX'
    });
    this.changeStatus('Submitting Entry');
    const body = await this.rp.get(this.url);
    const $ = cheerio.load(body);
    const formKey = $('input[name="form_key"]:not([value=""])').attr('value');
    const payload = {
      form_key: formKey,
      sku: this.raffleDetails.sku,
      fullname: `${this.profile.deliveryFirstName} ${this.profile.deliveryLastName}`,
      email: this.profile.email,
      address: this.profile.deliveryAddress,
      zipcode: this.profile.deliveryZip,
      city: this.profile.deliveryCity,
      country: this.profile.deliveryCountry,
      phone: this.profile.phone,
      Size_raffle: this.size.id,
      'g-recaptcha-response': captchaResponse.captchaToken
    };
    console.log(body);
    console.log(payload);
    return this.rp({
      headers: {
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        Origin: 'https://tres-bien.com',
        'Upgrade-Insecure-Requests': '1',
        'Content-Type':
          'multipart/form-data; boundary=----WebKitFormBoundaryqMAu0cUCyMVNelbH',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        'Sec-Fetch-Dest': 'document',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        Referer: this.url,
        'Accept-Language': 'en-US,en;q=0.9'
      },
      method: 'POST',
      uri: 'https://tres-bien.com/tbscatalog/manage/rafflepost/',
      followAllRedirects: true,
      resolveWithFullResponse: true,
      formData: payload
    });
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  makeEntry = async () => {
    ValidateSchema(ENDSchema, { ...this.profile });
    try {
      const entry = await this.submitEntry();
      console.log(entry);
      console.log(this.cookieJar);
    } catch (error) {
      console.log(error);
    }
  };
}
