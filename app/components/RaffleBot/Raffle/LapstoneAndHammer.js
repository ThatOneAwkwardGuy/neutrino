import { ValidateSchema, LapstoneAndHammerSchema } from '../schemas';

const rp = require('request-promise');
const HttpsProxyAgent = require('https-proxy-agent');

export default class LapstoneAndHammer {
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
      agent: proxy !== '' ? new HttpsProxyAgent(proxy) : null,
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
        this.changeStatus(`Error Submitting Raffle - ${error.message}`);
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  submitRaffle = () =>
    this.rp({
      uri: `${this.raffleDetails.formLink.replace(
        '/post?',
        '/post-json?'
      )}&c=jQuery190007078965363392142_1567090992893&EMAIL=${encodeURIComponent(
        this.profile.email
      )}&FNAME=${encodeURIComponent(
        this.profile.deliveryFirstName
      )}&LNAME=${encodeURIComponent(this.profile.deliveryLastName)}&MMERGE3=${
        this.size.id
      }&MMERGE4=&MMERGE5=&${
        this.raffleDetails.id
      }=&subscribe=Submit&_=1567090992894`,
      headers: {
        'sec-fetch-mode': 'no-cors',
        referrer: this.link,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      method: 'GET',
      resolveWithFullResponse: true
    });

  // https://lapstoneandhammer.us10.list-manage.com/subscribe/post-json?u=3dd44920c3e2410d48d7462fc&id=0322480296&c=jQuery19001958476886307381_1572100031612&&MMERGE3=Men+(7.5-14)&MMERGE4=13&MMERGE6=&MMERGE5=&b_3dd44920c3e2410d48d7462fc_0322480296=&subscribe=Submit&_=1572100031613

  makeEntry = async () => {
    ValidateSchema(LapstoneAndHammerSchema, { ...this.profile });

    this.changeStatus('Making Entry');
    const raffleResponse = await this.submitRaffle();
    console.log(raffleResponse);
    if (!raffleResponse.body.includes('"result":"success"')) {
      throw new Error('Failed To Enter Raffle');
    }
    this.changeStatus('Completed Entry');
    this.incrementRaffles({
      url: this.url,
      site: this.site,
      size: this.size ? this.size.name : '',
      style: this.style ? this.style.name : ''
    });
  };
}
