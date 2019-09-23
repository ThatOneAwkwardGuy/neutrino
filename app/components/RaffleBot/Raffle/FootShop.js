import { ipcRenderer } from 'electron';
import { getCaptchaResponse } from '../../../screens/Captcha/functions';
import { STOP_CAPTCHA_JOB } from '../../../constants/ipcConstants';
import { getFormData } from '../../AccountCreator/functions';
import { longToShortStates } from '../../../constants/constants';
import { getRandomIntInRange } from '../functions';

const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class FootShop {
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

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
    ipcRenderer.send(STOP_CAPTCHA_JOB, this.tokenID);
  };

  tokenizeCard = () =>
    this.rp({
      url: 'https://api2.checkout.com/v2/tokens/card',
      method: 'POST',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        authorization: 'pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187',
        'content-type': 'application/json',
        'sec-fetch-mode': 'cors',
        referrer:
          'https://js.checkout.com/frames/?v=1.0.16&publicKey=pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187&localisation=EN-GB&theme=standard',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      body: `{"number":"${this.profile.card.cardNumber}","expiryMonth":"${
        this.profile.card.expMonth
      }","expiryYear":"${this.profile.card.expYear.slice(-2)}","cvv":"${
        this.profile.card.cvv
      }","requestSource":"JS"}`
    });

  checkEmail = () => {
    this.rp({
      method: 'POST',
      url: `https://releases.footshop.com/api/registrations/check-duplicity/${this.raffleDetails.id}`,
      body: {
        email: this.profile.email,
        id: null,
        phone: this.profile.phone
      }
    });
  };

  submitEntry = cardToken => {
    this.rp({
      method: 'POST',
      url: `https://releases.footshop.com/api/registrations/create/${this.raffleDetails.id}`,
      body: {
        id: null,
        sizerunId: sizeID,
        account: 'New Customer',
        email: task.taskEmail,
        phone: this.profile.phone,
        gender: 'Mr',
        firstName: this.profile.deliveryFirstName,
        lastName: this.profile.deliveryLastName,
        birthday: `${getRandomIntInRange(1982, 2000)}-0${getRandomIntInRange(
          1,
          9
        )}-0${getRandomIntInRange(1, 9)}`,
        deliveryAddress: {
          country: this.profile.deliveryCountry,
          state: this.profile.deliveryRegion,
          county: '',
          city: this.profile.deliveryCity,
          street: this.profile.deliveryAddress,
          houseNumber: this.profile.deliveryApt,
          additional: this.profile.deliveryApt,
          postalCode: this.profile.deliveryZip
        },
        consents: ['privacy-policy-101'],
        cardToken,
        cardLast4: this.profile.card.cardNumber.slice(-4)
      }
    });
  };

  makeEntry = async () => {
    this.changeStatus('Check Email');
    const checkEmailResponse = this.checkEmail();
    console.log(checkEmailResponse);
    console.log(checkEmailResponse);
    if (!checkEmailResponse.email && !checkEmailResponse.phone) {
      this.changeStatus('Submitting Card Info');
      const tokenizeCardResponse = await this.tokenizeCard();
      const tokenizeCard = JSON.parse(tokenizeCardResponse);
      console.log(tokenizeCard);

      this.changeStatus('Completed Entry');
      this.incrementRaffles();
    } else {
      throw new Error('Email or Phone used before');
    }
  };
}
