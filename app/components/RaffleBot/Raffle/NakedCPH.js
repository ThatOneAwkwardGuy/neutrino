import { ValidateSchema, NakedCPHSchema } from '../schemas';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { sites, longToShortCountries } from '../../../constants/constants';
import { randomNumberInRange } from '../../AccountCreator/functions';

const rp = require('request-promise');
const cloudscraper = require('cloudscraper');
const uuidv4 = require('uuid/v4');
const cheerio = require('cheerio');

export default class NakedCPH {
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
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
    this.settings = settings;
    this.cookieJar = rp.jar();
    const tokenID = uuidv4();
    this.rp = cloudscraper.defaults({
      onCaptcha: async (options, response) => {
        const { captcha } = response;
        try {
          const captchaResponse = await getCaptchaResponse({
            // eslint-disable-next-line no-underscore-dangle
            cookiesObject: options.jar._jar.store.idx,
            url: captcha.uri.href,
            id: tokenID,
            agent: null,
            baseURL: sites[site],
            site,
            accountPass: profile.pass,
            settings,
            siteKey: captcha.siteKey
          });
          captcha.form['g-recaptcha-response'] = captchaResponse.captchaToken;
          captcha.submit();
        } catch (error) {
          console.log(error);
          captcha.submit(error);
        }
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
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
  };

  submitRaffleEntry = async () => {
    this.changeStatus('Getting Raffle Page');
    const response = await this.rp.get({
      uri: this.url,
      resolveWithFullResponse: true,
      jar: this.cookieJar
    });
    this.changeStatus('Processing Raffle Page');
    const body = response.body.toString();
    const $ = cheerio.load(body);
    const tags = $('input[name="tags[]"]').attr('value');
    const token = $('input[name="token"]').attr('value');
    this.changeStatus('Getting Captcha');
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: {},
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site,
      settings: this.settings,
      siteKey: '6LfbPnAUAAAAACqfb_YCtJi7RY0WkK-1T4b9cUO8'
    });
    this.changeStatus('Entering Raffle');
    const payload = {
      'tags[]': tags,
      token,
      rule_email: this.profile.email,
      phone_number: this.profile.phone,
      'fields[Raffle.First Name]': this.profile.deliveryFirstName,
      'fields[Raffle.Last Name]': this.profile.deliveryLastName,
      'fields[Raffle.Shipping Address]': this.profile.deliveryAddress,
      'fields[Raffle.Postal Code]': this.profile.deliveryZip,
      'fields[Raffle.City]': this.profile.deliveryCity,
      'fields[Raffle.Country]':
        longToShortCountries[this.profile.deliveryCountry] !== undefined
          ? longToShortCountries[this.profile.deliveryCountry]
          : '',
      'fields[SignupSource.ip]': `${randomNumberInRange(
        1,
        255
      )}.${randomNumberInRange(1, 255)}.${randomNumberInRange(
        1,
        255
      )}.${randomNumberInRange(1, 255)}`,
      'fields[SignupSource.useragent]':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
      language: 'sv',
      'g-recaptcha-response': captchaResponse.captchaToken
    };
    const finalResponse = await this.rp.post({
      form: payload,
      uri: 'https://app.rule.io/subscriber-form/subscriber'
    });
    if (
      finalResponse.includes('YOUR REGISTRATION FOR OUR FCFS WAS SUCCESSFUL')
    ) {
      this.changeStatus('Successful Entry');
      this.incrementRaffles({
        url: this.url,
        site: this.site,
        size: this.size ? this.size.name : '',
        style: this.style ? this.style.name : ''
      });
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };

  makeEntry = async () => {
    ValidateSchema(NakedCPHSchema, { ...this.profile });
    this.changeStatus('Started');
    await this.submitRaffleEntry();
  };
}
