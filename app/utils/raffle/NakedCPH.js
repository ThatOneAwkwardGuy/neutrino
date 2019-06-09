export default class NakedCPH {
  constructor(url, profile, site, style, size, status, proxy, forceUpdate) {
    this.url = url;
    this.profile = profile;
    this.run = false;
    this.site = site;
    this.style = style;
    this.size = size;
    this.status = status;
    this.forceUpdate = forceUpdate;
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

  getRaffleToken = async raffleId => {
    const response = this.rp({
      method: 'POST',
      uri: `https://nakedcph.typeform.com/app/form/result/token/${raffleId}/default`,
      body: {}
    });
  };
}
