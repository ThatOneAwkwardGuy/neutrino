const rp = require('request-promise');

export default class FootpatrolUK {
  constructor(url, profile, site, style, size, status, proxy) {
    this.url = url;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.rp = rp.defaults({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      proxy,
      jar: this.cookieJar
    });
  }

  start = () => {
    while (this.run) {
      try {
        this.makeEntry();
      } catch (error) {}
      this.run = false;
    }
  };

  makeEntry = async () => {
    const params = this.url.split('html')[1].split('?');
    const tag = params[1].split('=')[1];
    const shortTag = params[2].split('=')[1];
    const response = await this.rp({
      method: 'GET',
      headers: {
        referrer:
          'https://footpatrol.s3.amazonaws.com/content/site/2017/FootPatrolRafflePage-nike-sacai-UK.html?fullTag=UK_NIKE_SACAI_LD?shortTag=UK_NIKE_SACAI?prodcutName=Nike-x-Sacai-Blazer?imgUrl=https://i8.amplience.net/i/jpl/su19-sacai-assets-blazer-blue-1x1-2-71e4f77344d11d50bd6ef3955955db6b',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      uri: `https://redeye.footpatrol.com/cgi-bin/rr/blank.gif?nourl=${tag}&firstName=${name}&email=${this.profile.email}&telephone=${
        this.profile.tel
      }${shortTag}_shoetype=${this.style}${shortTag}_shoesize=${this.size}${shortTag}_cityofres=${this.profile.city}&yzemail=${tag}${shortTag}_countryofres=${
        this.profile.region
      }&emailpermit=0&sms_optout=0&site=FP&currency=GBP`
    });
    console.log(response);
  };
}
