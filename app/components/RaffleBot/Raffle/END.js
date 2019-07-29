/* eslint-disable */
const rp = require('request-promise');
const { remote, BrowserWindow } = require('electron');
const uuidv4 = require('uuid/v4');
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
    this.proxy = proxy;
    this.forceUpdate = forceUpdate;
    this.raffleDetails = raffleDetails;
    this.cookieJar = rp.jar();
    this.incrementRaffles = incrementRaffles;
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    };
    this.rp = rp.defaults({
      headers: this.headers,
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
        console.log(error);
        this.changeStatus(`Error Submitting Raffle - ${error.message}`);
      }
      this.run = false;
    }
  };

  stop = () => {
    this.run = false;
    this.changeStatus('Stopped');
  };

  setProxyForWindow = async (proxy, win) =>
    new Promise(resolve => {
      const proxyArray = proxy.split(/@|:/);
      if (proxyArray.length === 4) {
        win.webContents.session.on(
          'login',
          (event, request, authInfo, callback) => {
            event.preventDefault();
            callback(proxyArray[0], proxyArray[1]);
          }
        );
      }
      const proxyIpAndPort = proxyArray.slice(-2);
      win.webContents.session.setProxy(
        { proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` },
        () => {
          resolve();
        }
      );
    });

  loginToAccount = async () =>
    new Promise(async (resolve, reject) => {
      const tokenID = uuidv4();
      console.log(tokenID);
      const win = new BrowserWindow({
        width: 500,
        height: 650,
        show: true,
        frame: true,
        resizable: true,
        focusable: true,
        minimizable: true,
        closable: true,
        allowRunningInsecureContent: true,
        webPreferences: {
          webviewTag: true,
          allowRunningInsecureContent: true,
          nodeIntegration: true,
          webSecurity: false,
          session: remote.session.fromPartition(`${tokenID}`)
        }
      });
      if (this.proxy !== '') {
        await this.setProxyForWindow(this.proxy, win);
      }
      win.loadURL(this.url);
      win.webContents.on('dom-ready', () => {
        win.webContents.executeJavaScript(
          'window.document.title',
          false,
          result => {
            if (result !== '') {
              win.webContents.session.cookies.get(
                {},
                async (error, cookies) => {
                  if (error) {
                    reject(error);
                  } else {
                    cookies.forEach(cookie => {
                      const toughCookie = new tough.Cookie({
                        key: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        httpOnly: cookie.httpOnly,
                        hostOnly: cookie.hostOnly,
                        path: cookie.path
                      });
                      this.cookieJar.setCookie(
                        toughCookie.toString(),
                        this.url
                      );
                    });
                    win.close();
                    const test = await this.rp({
                      method: 'POST',
                      uri:
                        'https://launches-api.endclothing.com/api/account/login',
                      json: true,
                      body: {
                        email: this.profile.email,
                        password: this.profile.password
                      }
                    });
                    resolve(test);
                  }
                }
              );
            }
          }
        );
      });
    });

  getAccount = token =>
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/account',
      json: true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        Authorization: `Bearer ${token}`
      }
    });

  getPaymentMethods = token =>
    this.rp({
      method: 'GET',
      uri: 'https://launches-api.endclothing.com/api/payment-methods',
      json: true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        Authorization: `Bearer ${token}`
      }
    });

  addNewAddress = (customer, token) => {
    console.log(customer);
    console.log(token);
    // fetch('https://launches-api.endclothing.com/api/addresses', {
    //   credentials: 'include',
    //   headers: {
    //     accept: 'application/json',
    //     'access-control-allow-credentials': 'true',
    //     authorization: 'Bearer 6d8ew1zuntw760955da29af4wdmocpfy',
    //     'content-type': 'application/json; charset=UTF-8'
    //   },
    //   referrer: 'https://launches.endclothing.com/product/nike-x-off-white-zoom-terra-kiger-5-cd8179-300',
    //   referrerPolicy: 'no-referrer-when-downgrade',
    //   body:
    //     '{"city":"Grays","company":"","countryId":1,"firstName":"Moyo","lastName":"George","postCode":"RM17 5BN","street1":"asdasd Brooke Road","street2":null,"telephone":"07427488747","defaultBilling":false,"defaultShipping":true,"customerId":2533971}',
    //   method: 'POST',
    //   mode: 'cors'
    // });
    return this.rp({
      method: 'POST',
      uri: 'https://launches-api.endclothing.com/api/addresses',
      //   headers: {
      //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      //     Authorization: `Bearer ${token}`,
      //     'content-type': 'application/json; charset=UTF-8'
      //   },
      json: true,
      body: {
        city: this.profile.address.city,
        company: '',
        countryId: customer.group_id,
        customerId: customer.id,
        defaultBilling: false,
        defaultShipping: true,
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        postCode: this.profile.address.zipCode,
        street1: this.profile.address.address,
        street2: null,
        telephone: this.profile.phoneNumber
      }
    });
  };

  addNewPayment = async (customer, token) => {
    const braintreeResponse = await this.rp({
      method: 'POST',
      uri:
        'https://api.braintreegateway.com/merchants/s3qf7btpbbghkdyp/client_api/v1/payment_methods/credit_cards',
      body: {
        _meta: {
          merchantAppId: 'launches.endclothing.com',
          platform: 'web',
          sdkVersion: '3.11.0',
          source: 'hosted-fields',
          integration: 'custom',
          integrationType: 'custom',
          sessionId: uuidv4()
        },
        creditCard: {
          number: this.profile.paymentDetails.cardNumber,
          cvv: this.profile.paymentDetails.cvv,
          expiration_month: this.profile.paymentDetails.expirationMonth,
          expiration_year: this.profile.paymentDetails.expirationYear,
          options: { validate: false }
        },
        braintreeLibraryVersion: 'braintree/web/3.11.0',
        authorizationFingerprint: `4ad22037f10b3c92039d653dc3c4971cce02949322a64c0837a39f8ac0279763|created_at=${new Date()
          .toISOString()
          .slice(
            0,
            -1
          )}000000+0000&merchant_id=s3qf7btpbbghkdyp&public_key=6t9dpqt857v6mpbz`
      }
    });
    console.log(braintreeResponse);
    // return this.rp({
    //   method: 'POST',
    //   uri: 'https://launches-api.endclothing.com/api/payment-methods',
    //   json: true,
    //   headers: {
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: {
    //     customer_id: customer.id,
    //     website_id: 1,
    //     payment_method_nonce: 'tokencc_bd_m6qn6k_wgw2n5_q982bp_kkp8c3_2dy',
    //     device_data: '{"device_session_id":"71d572721441b7c1a39254a085c3856a","fraud_merchant_id":"600810"}',
    //     billing_address: {
    //       id: 6998319,
    //       firstName: 'Moyo',
    //       lastName: 'George',
    //       telephone: '7427488747',
    //       street1: '44 Brooke Road',
    //       city: 'Grays',
    //       regionId: 0,
    //       postCode: 'RM17 5BN',
    //       countryCode: 'GB',
    //       braintreeAddressId: null
    //     },
    //     default_payment: true
    //   }
    // });
  };

  makeEntry = async () => {
    const loginResponse = await this.loginToAccount();
    console.log(loginResponse);
    this.headers.Authorization = `Bearer ${loginResponse}`;
    console.log(this.headers);
    console.log(this.rp.defaults);
    const customer = await this.getAccount(loginResponse);
    console.log(customer);
    const paymentMethods = await this.getPaymentMethods(loginResponse);
    console.log(paymentMethods);
    let addressId;
    let paymentId;
    const addNewAddressResponse = await this.addNewAddress(
      customer,
      loginResponse
    );

    // if (customer.addresses.length === 0) {
    //   const addNewAddressResponse = await this.addNewAddress(customer, token);
    //   console.log(addNewAddressResponse);
    // } else {
    //   addressId = customer.addresses[0].id;
    // }
    const addNewPaymentResponse = this.addNewPayment(customer, loginResponse);

    // if (paymentMethods.length === 0) {
    //   const addNewPaymentResponse = this.addNewPayment(customer, token);
    // } else {
    //   paymentId = paymentMethods[0].entity_id;
    // }
  };
}
