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

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
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

  //https://nakedcph.typeform.com/app/form/submit/yUHpA1

  makeEntry = async () => {
    this.changeStatus('Started');
    const { token, landed_at } = await this.getRaffleToken(this.raffleDetails.typeformCode);
  };
}
