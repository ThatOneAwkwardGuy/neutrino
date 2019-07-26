const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const { ipcRenderer } = require('electron');

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
    forceUpdate
  ) {
    this.url = url;
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

  getCaptcha = () => {
    return new Promise((resolve, reject) => {
      try {
        const tokenID = uuidv4();
        ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
        ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
          checkoutURL: this.url,
          id: tokenID,
          type: 'VooStore',
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

  getFormData = object => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
  };

  submitRaffle = captchaToken => {
    return this.rp({
      method: 'POST',
      uri: 'https://raffle.vooberlin.com/ajax.php',
      headers: {
        origin: 'https://raffle.vooberlin.com',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        referer: this.url,
        authority: 'raffle.vooberlin.com',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        token: this.raffleDetails.token,
        page_id: this.raffleDetails.page_id,
        shoes_size: this.size.id,
        action: 'send_request',
        fax: '',
        name: this.profile.firstName,
        lastname: this.profile.lastName,
        email: this.profile.email,
        contact_number: this.profile.phoneNumber,
        streetname: this.profile.address.address,
        housenumber: this.profile.address.address,
        postalcode: this.profile.address.zipCode,
        city: this.profile.address.city,
        country: this.profile.address.region,
        countryhidden: '',
        'g-recaptcha-response': captchaToken
      }
    });
  };

  getRafflePage = () => {
    return this.rp.get(this.url);
  };

  makeEntry = async () => {
    this.changeStatus(`Getting Raffle Page`);
    await this.getRafflePage();
    this.changeStatus(`Getting Captcha Token`);
    const tokenID = uuidv4();
    const capthaResponse = await getCaptchaResponse({
      cookiesObject: false,
      url: this.url,
      id: tokenID,
      proxy: this.proxy,
      baseURL: this.site,
      site: this.site
    });
    console.log(capthaResponse);
    // this.changeStatus(`Submitting Raffle Entry`);
    // const submitRaffleResponse = await this.submitRaffle(
    //   captchaToken.captchaResponse
    // );
    // const submitRaffle = JSON.parse(submitRaffleResponse);
    // if (submitRaffle.error) {
    //   throw new Error(submitRaffle.msg);
    // } else {
    //   this.changeStatus(`Raffle Entry Successful`);
    // }
  };
}
