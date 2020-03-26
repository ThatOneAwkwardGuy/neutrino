import { ipcRenderer } from 'electron';
import { EightteenMontroseCountries } from '../../../constants/constants';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { ValidateSchema, EighteenMontroseSchema } from '../schemas';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

export default class EighteenMontrose {
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
    this.settings = settings;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.proxy = proxy;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.cookieJar = rp.jar();
    this.incrementRaffles = incrementRaffles;
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
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

  makeEntry = async () => {
    ValidateSchema(EighteenMontroseSchema, { ...this.profile });
    this.changeStatus(`Submitting Raffle Entry`);
    const payload = {
      [this.raffleDetails.checkboxFormID]: 1,
      8: 1,
      [this.raffleDetails.emailFormID]: this.profile.email,
      [this.raffleDetails.firstNameFormID]: this.profile.deliveryFirstName,
      [this.raffleDetails.lastNameFormID]: this.profile.deliveryLastName,
      [this.raffleDetails.countryFormID]:
        EightteenMontroseCountries[this.profile.deliveryCountry],
      [this.raffleDetails.instagramFormID]: this.profile.instagram,
      [this.raffleDetails.sizeFormID]: this.size.id,
      defaultSubmitAction: 'Complete',
      respondent: this.raffleDetails.respondent
    };
    await this.rp({
      method: 'POST',
      uri: `https://email.18montrose.com${this.raffleDetails.url}`,
      form: payload,
      resolveWithFullResponse: true,
      followAllRedirects: true
    });
    this.changeStatus('Successful Entry');
  };
}
