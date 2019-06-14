const rp = require('request-promise');

export default class ExtraButter {
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
      } catch (error) {
        this.changeStatus('Error Submitting Raffle');
      }
      this.run = false;
    }
  };

  getIDForSize = async () => {
    const raffleInfoResponse = await this.rp.get(`https://eb-draw.herokuapp.com/draws/${this.raffleDetails.product.product.id}`);
    const raffleInfo = JSON.parse(raffleInfoResponse);
    const variant = raffleInfo[0].variants.find(variant => String(variant.variant_id) === String(this.size.id));
    console.log(raffleInfo);
    console.log(variant);
    if (variant) {
      return variant;
    } else {
      throw new Error('Unable To Find ID For Size');
    }
  };

  createCustomer = async () => {
    return this.rp({
      method: 'POST',
      uri: 'https://eb-draw.herokuapp.com/customers/new',
      form: {
        first_name: this.profile.firstName,
        last_name: this.profile.lastName,
        email: this.profile.email
      }
    });
  };

  submitRaffle = async (variant, createCustomer) => {
    return this.rp({
      method: 'POST',
      uri: 'https://eb-draw.herokuapp.com/draws/entries/new',
      form: {
        shipping_first_name: this.profile.firstName,
        shipping_last_name: this.profile.lastName,
        customer_id: customerID,
        variant_id: variant.id,
        street_address: this.profile.address.address1,
        city: this.profile.address.city,
        zip: this.profile.address.zipCode,
        state: this.profile.address.state,
        phone: this.profile.address.address1,
        country: this.profile.phoneNumber,
        delivery_method: 'online'
      }
    });
  };

  makeEntry = async () => {
    const variant = await this.getIDForSize();
    console.log(variant);
    const createCustomer = await this.createCustomer();
    console.log(createCustomer);
  };

  changeStatus = status => {
    this.status = status;
    this.forceUpdate();
  };
}
