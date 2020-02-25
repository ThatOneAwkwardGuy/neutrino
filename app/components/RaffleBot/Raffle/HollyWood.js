import { ValidateSchema, HollyWoodSchema } from '../schemas';

const rp = require('request-promise');

export default class HollyWood {
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
    this.cookieJar = rp.jar();
    this.rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
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

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  getRaffleToken = async raffleId => {
    this.changeStatus('Getting Raffle Token');
    const response = await this.rp({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        pragma: 'no-cache',
        referrer: `https://caliroots.typeform.com/to/${raffleId}`,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      uri: `https://caliroots.typeform.com/app/form/result/token/${raffleId}/default`,
      form: {}
    });
    return JSON.parse(response);
  };

  submitRaffleEntry = async (token, landedAt) => {
    this.changeStatus('Submitting Raffle Entry');
    const payload = {};
    const formObj = {};
    this.raffleDetails.renderData.form.fields.forEach(row => {
      if (row.title === 'FIRST NAME') {
        formObj['0'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryFirstName,
          type: 'text'
        };
      } else if (row.title === 'LAST NAME') {
        formObj['1'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryLastName,
          type: 'text'
        };
      } else if (row.title === 'EMAIL ADDRESS') {
        formObj['2'] = {
          field: { id: row.id, type: row.type },
          email: this.profile.email,
          type: 'email'
        };
      } else if (row.title === 'ADDRESS') {
        formObj['3'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryAddress,
          type: 'text'
        };
      } else if (row.title === 'POSTAL/ZIP CODE') {
        formObj['4'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryZip,
          type: 'text'
        };
      } else if (row.title === 'CITY') {
        formObj['5'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryCity,
          type: 'text'
        };
      } else if (row.title === 'STATE/PROVINCE/REGION') {
        formObj['6'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryRegion,
          type: 'text'
        };
      } else if (row.title === 'COUNTRY') {
        formObj['7'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryCountry,
          type: 'text'
        };
      } else if (row.title === 'YOUR US SIZE') {
        formObj['8'] = {
          field: { id: row.id, type: row.type },
          text: this.size.id,
          type: 'text'
        };
      }
    });
    payload.answers = Object.values(formObj);
    payload.form_id = this.raffleDetails.typeformCode;
    payload.signature = token;
    payload.landed_at = parseInt(landedAt, 10);
    const response = await this.rp({
      method: 'POST',
      json: true,
      uri: `https://caliroots.typeform.com/app/form/submit/${this.raffleDetails.typeformCode}`,
      body: payload
    });
    return response;
  };

  makeEntry = async () => {
    ValidateSchema(HollyWoodSchema, { ...this.profile });
    this.changeStatus('Started');
    // eslint-disable-next-line camelcase
    const { token, landed_at } = await this.getRaffleToken(
      this.raffleDetails.typeformCode
    );

    const submissionResponse = await this.submitRaffleEntry(token, landed_at);

    if (submissionResponse.message === 'success') {
      this.changeStatus('Successful Entry');
      this.incrementRaffles({
        url: this.url,
        site: this.site,
        size: this.size ? this.size.name : '',
        style: this.style ? this.style.name : ''
      });
    }
  };
}
