import { BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, OPEN_CAPTCHA_WINDOW, RECEIVE_CAPTCHA_TOKEN, FINISH_SENDING_CAPTCHA_TOKEN } from '../constants';
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const ipcRenderer = require('electron').ipcRenderer;
export default class OneBlockDown {
  constructor(url, profile, site, style, size, status, proxy, raffleDetails, forceUpdate) {
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
    this.headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' };
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

  login = () => {
    return this.rp({
      method: 'POST',
      uri: 'https://www.oneblockdown.it/index.php',
      headers: {
        origin: 'https://www.oneblockdown.it',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        accept: 'application/json, text/javascript, */*; q=0.01',
        referer: 'https://www.oneblockdown.it/en/login',
        authority: 'www.oneblockdown.it',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        controller: 'auth',
        action: 'authenticate',
        type: 'standard',
        extension: 'obd',
        credential: this.profile.email,
        password: this.profile.password,
        version: '103'
      }
    });
  };

  getCaptcha = () => {
    return new Promise((resolve, reject) => {
      try {
        const tokenID = uuidv4();
        ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
        ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
          checkoutURL: this.url,
          cookiesObject: this.cookieJar._jar.store.idx,
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

  submitRaffle = (login, captchaToken) => {
    return this.rp({
      method: 'POST',
      uri: 'https://www.oneblockdown.it/index.php',
      headers: {
        origin: 'https://www.oneblockdown.it',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        extension: 'raffle',
        controller: 'raffles',
        action: 'subscribe',
        response: captchaToken.captchaResponse,
        userId: login.payload,
        stockItemId: this.raffleDetails.stockItemId,
        itemId: this.raffleDetails.itemId,
        raffleId: this.raffleDetails.raffleID,
        inStore: '',
        addressId: 'n',
        'address[countryId]': this.formatCountry(this.profile.address.region),
        'address[first_name]': this.profile.firstName,
        'address[last_name]': this.profile.lastName,
        'address[street_address]': this.profile.address.address,
        'address[zipcode]': this.profile.address.zipCode,
        'address[cityName]': this.profile.address.city,
        'address[phone_number]': this.profile.phoneNumber,
        'address[statecode]': this.profile.address.state,
        version: '103'
      }
    });
  };

  formatCountry = profileCountry => {
    switch (profileCountry) {
      case 'United Kingdom':
        return '77';
      case 'United States':
        return '233';
      case 'Canada':
        return '38';
      case 'North Ireland':
        return '77';
      case 'Ireland':
        return '102';
      case 'Germany':
        return '57';
      case 'Switzerland':
        return '43';
      case 'France':
        return '75';
      case 'Spain':
        return '68';
      case 'Italy':
        return '110';
      case 'Netherlands':
        return '166';
      case 'Czech Republic':
        return '56';
      case 'Australia':
        return '13';
      case 'Austria':
        return '12';
      case 'Slovakia':
        return '202';
      case 'Belgium':
        return '20';
      case 'Slovenia':
        return '200';
      case 'Singapore':
        return '198';
      case 'Malaysia':
        return '158';
      case 'Hong Kong':
        return '95';
      case 'China':
        return '48';
      case 'Japan':
        return '114';
      case 'Sweden':
        return '197';
      case 'Denmark':
        return '59';
      case 'Finland':
        return '70';
      case 'Romania':
        return '189';
      default:
        return undefined;
    }
  };

  makeEntry = async () => {
    this.changeStatus(`Logging In`);
    const loginRepsonse = await this.login();
    console.log(loginRepsonse);
    const login = JSON.parse(loginRepsonse);
    this.changeStatus(`Getting Captcha Token`);
    const captchaToken = await this.getCaptcha();
    console.log(captchaToken);
    this.changeStatus(`Submitting Raffle Entry`);
    const submitRaffleResponse = await this.submitRaffle(login, captchaToken);
    console.log(submitRaffleResponse);
    const submitRaffle = JSON.parse(submitRaffleResponse);
    console.log(submitRaffle);
    if (submitRaffle.success === true) {
      this.changeStatus(`Successful Entry`);
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
