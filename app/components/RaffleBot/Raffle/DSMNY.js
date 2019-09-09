const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

export default class DSMNY {
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

  submitEntry1 = token =>
    this.rp({
      uri: 'https://raffle-uat.cloud.jdplc.com/api/raffleEntry',
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      strictSSL: false,
      body: JSON.stringify({
        campaign_name: this.raffleDetails.title,
        raf_id: token,
        timestamp: new Date().toGMTString(),
        raf_size: this.size,
        fascia: 'FOOTPATROL_GB'
      })
    });

  submitEntry2 = token =>
    this.rp({
      method: 'GET',
      headers: {
        referrer: this.url,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      resolveWithFullResponse: true,
      uri: `https://redeye.footpatrol.com/cgi-bin/rr/blank.gif?nourl=raffle&raf_name=${encodeURIComponent(
        this.raffleDetails.title
      )}&raf_id=${token}&email=${
        this.profile.email
      }&int_segment=GB&raf_firstname=${
        this.profile.deliveryFirstName
      }&raf_lastname=${
        this.profile.deliveryLastName
      }&raf_house=${encodeURIComponent(
        this.profile.deliveryAddress
      )}&raf_postcode=${encodeURIComponent(
        this.profile.deliveryZip
      )}&raf_mobile=${this.profile.phone}&raf_size=${encodeURIComponent(
        this.size
      )}&raf_shoetype=${this.style}&sms_optout=0&emailpermit=0`
    });

  makeEntry = async () => {
    const token = uuidv4();
    this.changeStatus('Submitting Raffle Token');
    const response1 = await this.submitEntry1(token);
    console.log(response1);
    this.changeStatus('Submitting Raffle Entry');
    const response2 = await this.submitEntry2(token);
    console.log(response2);
    this.changeStatus('Successful Entry');
    this.incrementRaffles();
  };
}
