import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';

const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

export default class OneBlockDown {
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
    this.proxy = proxy;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.incrementRaffles = incrementRaffles;
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

  login = () =>
    this.rp({
      method: 'POST',
      uri: 'https://www.oneblockdown.it/index.php',
      headers: {
        origin: 'https://www.oneblockdown.it',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
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

  submitRaffle = (login, captchaResponse) =>
    this.rp({
      method: 'POST',
      uri: 'https://www.oneblockdown.it/index.php',
      headers: {
        origin: 'https://www.oneblockdown.it',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        extension: 'raffle',
        controller: 'raffles',
        action: 'subscribe',
        response: captchaResponse.captchaToken,
        userId: login.payload,
        stockItemId: this.raffleDetails.stockItemId,
        itemId: this.raffleDetails.itemId,
        raffleId: this.raffleDetails.raffleID,
        inStore: '',
        addressId: 'n',
        'address[countryId]': this.formatCountry(this.profile.deliveryRegion),
        'address[first_name]': this.profile.deliveryFirstName,
        'address[last_name]': this.profile.deliveryLastName,
        'address[street_address]': this.profile.deliveryAddress,
        'address[zipcode]': this.profile.deliveryZip,
        'address[cityName]': this.profile.deliveryCity,
        'address[phone_number]': this.profile.phone,
        'address[statecode]': this.profile.deliveryRegion,
        version: '103'
      }
    });

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
    const captchaResponse = await getCaptchaResponse({
      // eslint-disable-next-line no-underscore-dangle
      cookiesObject: this.cookieJar._jar.store.idx,
      url: this.url,
      id: this.tokenID,
      proxy: this.proxy,
      baseURL: this.url,
      site: this.site
    });
    console.log(captchaResponse);
    this.changeStatus(`Submitting Raffle Entry`);
    const submitRaffleResponse = await this.submitRaffle(
      login,
      captchaResponse
    );
    console.log(submitRaffleResponse);
    const submitRaffle = JSON.parse(submitRaffleResponse);
    console.log(submitRaffle);
    if (submitRaffle.success === true) {
      this.changeStatus(`Successful Entry`);
      this.incrementRaffles();
    } else {
      this.changeStatus(`Error Submitting Entry`);
    }
  };
}
