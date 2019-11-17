import { ValidateSchema, NakedCPHSchema } from '../schemas';

const rp = require('request-promise');

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
        referrer: `https://nakedcph.typeform.com/to/${raffleId}`,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      uri: `https://nakedcph.typeform.com/app/form/result/token/${raffleId}/default`,
      form: {}
    });
    return JSON.parse(response);
  };

  submitRaffleEntry = async (token, landedAt) => {
    this.changeStatus('Submitting Raffle Entry');
    const payload = {};
    const formObj = {};
    this.raffleDetails.renderData.form.fields.forEach((row, index) => {
      if (row.title.includes('first name')) {
        formObj['1'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryFirstName,
          type: 'text'
        };
      } else if (row.title.includes('last name')) {
        formObj['2'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryLastName,
          type: 'text'
        };
      } else if (row.title.includes('email')) {
        formObj['5'] = {
          field: { id: row.id, type: row.type },
          email: this.profile.email,
          type: 'email'
        };
      } else if (row.title.includes('postal code')) {
        formObj['6'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryZip,
          type: 'text'
        };
      } else if (row.title.includes('country are you')) {
        formObj['7'] = {
          field: { id: row.id, type: row.type },
          text: this.profile.deliveryCountry,
          type: 'text'
        };
      } else if (row.title.includes('Our Captcha is') && index === 0) {
        const { ref } = row;
        const matchingLogic = this.raffleDetails.renderData.form.logic.find(
          logic => logic.ref === ref
        );
        formObj['0'] = {
          field: { id: row.id, type: row.type },
          text: matchingLogic.actions[0].condition.vars[1].value,
          type: 'text'
        };
      } else if (row.title.includes('Our Captcha is')) {
        const { ref } = row;
        const matchingLogic = this.raffleDetails.renderData.form.logic.find(
          logic => logic.ref === ref
        );
        formObj['3'] = {
          field: { id: row.id, type: row.type },
          text: matchingLogic.actions[0].condition.vars[1].value,
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
      uri: `https://nakedcph.typeform.com/app/form/submit/${this.raffleDetails.typeformCode}`,
      body: payload
    });
    return response;
  };

  makeEntry = async () => {
    ValidateSchema(NakedCPHSchema, { ...this.profile });
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
