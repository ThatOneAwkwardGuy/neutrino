const rp = require('request-promise');

export default class FootpatrolUK {
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
    this.cookieJar = rp.jar();
    this.incrementRaffles = incrementRaffles;
    this.rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      proxy,
      jar: this.cookieJar
    });
  }

  start = async () => {
    while (this.run) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.makeEntry();
      } catch (error) {
        console.log(error);
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };

  makeEntry = async () => {
    this.changeStatus('Started');
    const name = `${this.profile.firstName}%20${this.profile.lastName}`;
    const params = this.url.split('html')[1].split('?');
    const tag = params[1].split('=')[1];
    const shortTag = params[2].split('=')[1];
    this.changeStatus('Submitting Raffle Entry');
    const response = await this.rp({
      method: 'GET',
      headers: {
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      resolveWithFullResponse: true,
      uri: `https://redeye.footpatrol.com/cgi-bin/rr/blank.gif?nourl=${tag}&firstName=${name}&email=${
        this.profile.email
      }&telephone=${this.profile.phoneNumber}&${shortTag}_shoetype=${
        this.style
      }&${shortTag}_shoesize=${this.size}&${shortTag}_cityofres=${
        this.profile.city
      }&yzemail=${tag}${shortTag}_countryofres=${encodeURIComponent(
        this.profile.region
      )}&emailpermit=0&sms_optout=0&site=FP&currency=GBP`
    });
    console.log(response);
    this.changeStatus('Successful Entry');
    this.incrementRaffles();
  };
}
