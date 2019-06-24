const rp = require('request-promise');

export default class NakedCPH {
  constructor(url, profile, site, style, size, status, proxy, raffleDetails, forceUpdate) {
    this.url = url;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.cookieJar = rp.jar();
    this.rp = rp.defaults({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
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
        await this.makeEntry();
      } catch (error) {
        this.changeStatus('Error Submitting Raffle');
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
      uri: `https://nakedcph.typeform.com/app/form/result/token/${raffleId}/default`,
      body: {}
    });
    return response;
  };

  makeEntry = async () => {
    this.changeStatus('Started');
    const { token, landed_at } = await this.getRaffleToken(this.raffleDetails.typeformCode);
    const payload = {};
    this.raffleDetails.renderData.form.fields.forEach(row => {
      if (row.title.includes('first name')) {
        payload[`form[textfield:${row.id}]`] = this.profile.firstName;
      } else if (row.title.includes('last name')) {
        payload[`form[textfield:${row.id}]`] = this.profile.lastName;
      } else if (row.title.includes('email')) {
        payload[`form[${row.type}:${row.id}]`] = this.profile.email;
      } else if (row.title.includes('country')) {
        payload[`form[${row.type}:${row.id}]`] = this.profile.region;
      }
    });
    payload['form[token]'] = token;
    payload['form[landed_at]'] = landed_at;
    payload['form[language]'] = this.raffleDetails.renderData.form.settings.language;
    this.changeStatus('Submitting Raffle Entry');
    const response = await this.rp({
      method: 'POST',
      uri: `https://nakedcph.typeform.com/app/form/submit/${raffleId}`,
      form: payload
    });
    this.changeStatus('Finished');
  };
}
