import { ValidateSchema, ENDSchema } from '../schemas';
import { ENDCountries } from '../../../constants/constants';
import { getCookiesFromWindow } from '../functions';

const rp = require('request-promise');
const braintree = require('braintree-web');
const tough = require('tough-cookie');

export default class END {
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

  checkEmailExists = async email => {
    const response = await this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/account/exists',
      json: true,
      body: { email }
    });
    return response.exists;
  };

  login = async () =>
    this.rp({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.9',
        'access-control-allow-credentials': 'true',
        'cache-control': 'no-cache',
        'content-type': 'application/json; charset=UTF-8',
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        referrer: this.url
      },
      uri: 'https://launches-api.endclothing.com/api/account/login',
      json: true,
      body: { email: this.profile.email, password: this.profile.password }
    });

  getAccountInfo = async authToken =>
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/account',
      json: true,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

  addAddressToAccount = async (account, authToken) =>
    this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/addresses',
      json: true,
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: {
        city: this.profile.deliveryCity,
        company: '',
        countryId: ENDCountries[this.profile.deliveryCountry],
        firstName: this.profile.deliveryFirstName,
        lastName: this.profile.deliveryLastName,
        postCode: this.profile.deliveryZip,
        street1: this.profile.deliveryAddress,
        street2: '',
        telephone: this.profile.phone,
        defaultBilling: false,
        defaultShipping: true,
        customerId: account.id
      }
    });

  addPaymentMethod = async (account, address, authToken) => {
    const token = await this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/gateway/token',
      body: {},
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      json: true
    });
    const client = new braintree.api.Client({
      clientToken: token.value
    });
    client.tokenizeCard(
      {
        number: this.profile.card.cardNumber,
        cardholderName:
          this.profile.card.paymentCardholdersName ||
          `${this.profile.billingFirstName} ${this.profile.billingLastName}`,
        expirationMonth: this.profile.card.expMonth,
        expirationYear: this.profile.card.expYear,
        cvv: this.profile.card.cvv
      },
      async (err, nonce) => {
        if (err) {
          return new Error();
        }
        console.log(address);
        await this.rp({
          method: 'POST',
          uri: 'https://launches-api.endclothing.com/api/payment-methods',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          json: true,
          body: {
            customer_id: account.id,
            website_id: 1,
            payment_method_nonce: nonce,
            device_data:
              '{"device_session_id":"10ac1a2c94748e35f01403d6d14d6427","fraud_merchant_id":"600810"}',
            billing_address: {
              id: address.id,
              firstName: address.firstname,
              lastName: address.lastname,
              telephone: address.telephone,
              street1: address.street[0],
              city: address.city,
              regionName: address.region.region,
              regionId: address.region.region_id,
              postCode: address.postcode,
              countryCode: address.country_id,
              braintreeAddressId: null
            },
            default_payment: true
          }
        });
      }
    );
  };

  getPaymentMethods = authToken =>
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/payment-methods',
      json: true,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

  getOrCreateAddress = async authToken => {
    this.changeStatus('Getting Account Info');
    const accountInfo = await this.getAccountInfo(authToken);
    if (accountInfo.addresses.length === 1) {
      this.changeStatus('Adding New Address');
      try {
        const newAddress = await this.addAddressToAccount(
          accountInfo,
          authToken
        );
        return newAddress.addresses[0];
      } catch (error) {
        throw new Error('Error adding new address to account.');
      }
    } else {
      return accountInfo.addresses[0];
    }
  };

  getOrCreatePayment = async (account, address, authToken) => {
    this.changeStatus('Getting Payment Info');
    const paymentMethods = await this.getPaymentMethods(authToken);
    console.log(paymentMethods);
    if (paymentMethods.length === 0) {
      this.changeStatus('Adding New Payment Method');
      try {
        return await this.addPaymentMethod(account, address, authToken);
      } catch (error) {
        throw new Error('Error adding new payment info to account.');
      }
    } else {
      return paymentMethods[0];
    }
  };

  submitEntry = (account, address, payment, authToken) =>
    this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/subscriptions',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      json: true,
      body: {
        customer_id: account.id,
        product_size_id: this.size.id,
        shipping_address_id: address.id,
        billing_address_id: address.id,
        payment_method_id: payment.entity_id,
        shipping_method_id: 1,
        website_id: 1,
        postcode: address.postcode,
        street: address.street[0],
        subscription_origin: 'web'
      }
    });

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  makeEntry = async () => {
    ValidateSchema(ENDSchema, { ...this.profile });
    const cookies = await getCookiesFromWindow(this.url, this.proxy);
    cookies.forEach(cookie => {
      if (cookie.domain === '.endclothing.com') {
        const toughCookie = new tough.Cookie({
          key: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          httpOnly: cookie.httpOnly,
          hostOnly: cookie.hostOnly,
          path: cookie.path
        });
        this.cookieJar.setCookie(toughCookie.toString(), this.url);
      }
    });
    this.changeStatus('Logging Into Account');
    const authToken = await this.login();
    const account = await this.getAccountInfo(authToken);
    const address = await this.getOrCreateAddress(authToken);
    const payment = await this.getOrCreatePayment(account, address, authToken);
    this.changeStatus('Submitting Entry');
    const entry = await this.submitEntry(account, address, payment, authToken);
    console.log(entry);
    this.changeStatus('Successfully Submitted Entry');
  };
}
