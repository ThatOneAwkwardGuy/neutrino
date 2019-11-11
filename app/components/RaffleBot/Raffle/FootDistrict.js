import { ValidateSchema, FootDistrictSchema } from '../schemas';

const rp = require('request-promise');

export default class FootDistrict {
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
        referrer: `https://footdistrict.typeform.com/to/${raffleId}`,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      uri: `https://footdistrict.typeform.com/app/form/result/token/${raffleId}/default`,
      form: {}
    });
    return JSON.parse(response);
  };

  submitRaffleEntry = async (token, landedAt) => {
    this.changeStatus('Submitting Raffle Entry');
    const payload = {};
    const formObj = {};
    this.raffleDetails.renderData.form.fields.forEach(row => {
      if (row.title.includes('Choose your language')) {
        const choice = row.properties.choices.find(
          elem => elem.label === 'English'
        );
        formObj['0'] = {
          field: { id: row.id, type: row.type },
          choices: [{ id: choice.id, label: choice.label }],
          type: 'choices'
        };
      } else if (row.title.includes('your complete name')) {
        formObj['1'] = {
          field: { id: row.id, type: row.type },
          text: `${this.profile.deliveryFirstName} ${this.profile.deliveryLastName}`,
          type: 'text'
        };
      } else if (row.title.includes('a valid email')) {
        formObj['2'] = {
          field: { id: row.id, type: row.type },
          email: this.profile.email,
          type: 'email'
        };
      } else if (row.title.includes('your Size')) {
        formObj['3'] = {
          field: { id: row.id, type: row.type },
          text: this.size.id,
          type: 'text'
        };
      } else if (row.title.includes('accept our Terms and')) {
        formObj['4'] = {
          field: { id: row.id, type: row.type },
          boolean: true,
          type: 'boolean'
        };
      } else if (row.title.includes('you consent that')) {
        formObj['5'] = {
          field: { id: row.id, type: row.type },
          boolean: true,
          type: 'boolean'
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
      uri: `https://footdistrict.typeform.com/app/form/submit/${this.raffleDetails.typeformCode}`,
      body: payload
    });
    return response;
  };

  makeEntry = async () => {
    ValidateSchema(FootDistrictSchema, { ...this.profile });
    this.changeStatus('Started');
    // eslint-disable-next-line camelcase
    const { token, landed_at } = await this.getRaffleToken(
      this.raffleDetails.typeformCode
    );

    const submissionResponse = await this.submitRaffleEntry(token, landed_at);

    if (submissionResponse.message === 'success') {
      this.changeStatus('Successful Entry');
      this.incrementRaffles();
    }
  };
}
