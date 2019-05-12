import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
import Toggle from 'react-toggle';
const randomEmail = require('random-email');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');
const { clipboard } = require('electron');
const uuidv4 = require('uuid/v4');
const ipcRenderer = require('electron').ipcRenderer;
var tough = require('tough-cookie');
const cheerio = require('cheerio');

import {
  BOT_SEND_COOKIES_AND_CAPTCHA_PAGE,
  OPEN_CAPTCHA_WINDOW,
  RECEIVE_CAPTCHA_TOKEN,
  FINISH_SENDING_CAPTCHA_TOKEN,
  RESET_CAPTCHA_WINDOW
} from '../utils/constants';

const sites = {
  cncpts: 'https://cncpts.com',
  bdgastore: 'https://bdgastore.com',
  '12amrun': 'https://www.12amrun.com',
  '18montrose': 'https://18montrose.com',
  'a-ma-maniere': 'https://www.a-ma-maniere.com',
  'above the clouds': 'https://www.abovethecloudsstore.com',
  addictmiami: 'https://www.addictmiami.com',
  'a life new york': 'https://alifenewyork.com',
  'amigo skate shop': 'https://amigoskateshop.com',
  'amongst few': 'https://www.amongstfew.com',
  apbstore: 'https://www.apbstore.com',
  antisocialsocialclub: 'https://www.antisocialsocialclub.com',
  atmosny: 'https://atmosny.com',
  'bape-us': 'https://us.bape.com',
  bbbranded: 'https://www.bbbranded.com',
  'bbcicecream-us': 'https://www.bbcicecream.com',
  'bbcicecream-eu': 'https://bbcicecream.eu',
  blacksheepskateshop: 'https://blacksheepskateshop.com',
  blkmkt: 'https://www.blkmkt.us',
  blendsus: 'https://www.blendsus.com',
  bdgastore: 'https://bdgastore.com',
  bowsandarrowsberkeley: 'https://www.bowsandarrowsberkeley.com',
  beatniconline: 'https://beatniconline.com',
  'the canteen': 'https://canteen.theberrics.com',
  capsuletoronto: 'https://www.capsuletoronto.com',
  centre214: 'https://centre214.com',
  cityblueshop: 'https://www.cityblueshop.com',
  commonwealth: 'https://commonwealth-ftgg.com',
  cncpts: 'https://cncpts.com',
  concrete: 'https://concrete.nl',
  thedarksideinitiative: 'https://www.thedarksideinitiative.com',
  deadstock: 'https://www.deadstock.ca',
  defcongroup: 'https://defcongroup.com',
  diamondsupplyco: 'https://www.diamondsupplyco.com',
  doomsday: 'https://doomsday-store.com',
  'dope-factory': 'https://www.dope-factory.com',
  exclucitylife: 'https://shop.exclucitylife.com',
  extrabutterny: 'https://shop.extrabutterny.com',
  fearofgod: 'https://fearofgod.com',
  featuresneakerboutique: 'https://www.featuresneakerboutique.com',
  ficegallery: 'https://www.ficegallery.com',
  flatspot: 'https://www.flatspot.com',
  freshragsfl: 'https://freshragsfl.com',
  funkoshop: 'https://www.funko-shop.com',
  ghostlifestyle: 'https://www.ghostlifestyle.com',
  hanon: 'https://www.hanon-shop.com',
  havenshop: 'https://havenshop.com',
  highsandlows: 'https://www.highsandlows.net.au',
  justdon: 'https://justdon.com',
  kith: 'https://kith.com',
  kongonline: 'https://www.kongonline.co.uk',
  kyliecosmetics: 'https://www.kyliecosmetics.com',
  laceupnyc: 'https://laceupnyc.com',
  lapstoneandhammer: 'https://www.lapstoneandhammer.com',
  toytokyo: 'https://launch.toytokyo.com',
  leaders1354: 'https://www.leaders1354.com',
  machusonline: 'https://www.machusonline.com',
  manorphx: 'https://www.manorphx.com',
  menuskateshop: 'https://menuskateshop.com',
  minishopmadrid: 'https://www.minishopmadrid.com',
  mondotees: 'https://mondotees.com',
  nocturnalskateshop: 'https://www.nocturnalskateshop.com',
  noirfonce: 'https://www.noirfonce.eu',
  notre: 'https://www.notre-shop.com',
  nrml: 'https://nrml.ca',
  'octobersveryown-us': 'https://us.octobersveryown.com',
  'octobersveryown-ca': 'https://ca.octobersveryown.com',
  'octobersveryown-uk': 'https://uk.octobersveryown.com',
  offthehook: 'https://offthehook.ca',
  oipolloi: 'https://www.oipolloi.com',
  oneness287: 'https://www.oneness287.com',
  over9000: 'https://over9000.com',
  oqium: 'https://oqium.com',
  packershoes: 'https://packershoes.com',
  'palace-uk': 'https://shop.palaceskateboards.com',
  'palace-us': 'https://shop-usa.palaceskateboards.com',
  pampamlondon: 'https://www.pampamlondon.com',
  'par5 milano': 'https://par5-milano-yeezy.com',
  philipbrownemenswear: 'https://www.philipbrownemenswear.co.uk',
  properlbc: 'https://properlbc.com',
  publicschoolnyc: 'https://publicschoolnyc.com',
  reigningchamp: 'https://reigningchamp.com',
  renarts: 'https://renarts.com',
  rimenyc: 'https://www.rimenyc.com',
  rise45: 'https://rise45.com',
  rockcitykicks: 'https://rockcitykicks.com',
  rooneyshop: 'https://www.rooneyshop.com',
  rooted: 'https://stay-rooted.com',
  rsvpgallery: 'https://rsvpgallery.com',
  saintalfred: 'https://www.saintalfred.com',
  shoegallerymiami: 'https://shoegallerymiami.com',
  unionjordan: 'https://secure.unionjordan.com',
  shopnicekicks: 'https://shopnicekicks.com',
  sneakerpolitics: 'https://sneakerpolitics.com',
  sneakerworldshop: 'https://sneakerworldshop.com',
  socialstatuspgh: 'https://www.socialstatuspgh.com',
  soleclassics: 'https://soleclassics.com',
  solefly: 'https://www.solefly.com',
  solestop: 'https://www.solestop.com',
  // sotostore: 'https://www.sotostore.com',
  'suede-store': 'https://suede-store.com',
  super7: 'https://super7.com',
  sukamii: 'https://www.sukamii.com',
  swanstreet: 'https://swanstreet.la',
  thepremierstore: 'https://thepremierstore.com',
  trophyroomstore: 'https://www.trophyroomstore.com',
  undefeated: 'https://undefeated.com',
  unknwn: 'https://www.unknwn.com',
  urbanindustry: 'https://www.urbanindustry.co.uk',
  westnyc: 'https://www.westnyc.com',
  wishatl: 'https://wishatl.com',
  worldofhombre: 'https://www.worldofhombre.com',
  xhibition: 'https://www.xhibition.co',
  valenciabyenrica: 'https://valenciabyenrica.com',
  ittaherlcurated: 'https://www.ittaherlcurated.com'
};

export default class AccountCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confModal: false,
      randomPassword: false,
      randomFirstLast: true,
      useProxies: false,
      advancedSettings: false,
      accountCreationDelay: true,
      createdAccount: [],
      site: Object.keys(sites)[0],
      quantity: 1,
      catchall: '',
      password: '',
      firstName: '',
      lastName: '',
      accountCreationDelayAmount: 5000
    };
    this.tokenIDs = [];
    this.cookieJars = {};
    this.rp = request.defaults({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      }
    });
  }

  componentDidMount = () => {
    this.awaitShopifyAccountChallenge();
  };

  returnOptions = (optionsArray, name) => {
    return optionsArray.map((elem, index) => <option key={`option-${name}-${index}`}>{elem}</option>);
  };

  toggleConfModal = () => {
    this.setState({
      confModal: !this.state.confModal
    });
  };

  loadAllAccounts = () => {
    this.setState({
      createdAccount: this.props.accounts.accounts
    });
  };

  returnAccountRow = (account, index) => (
    <tr key={`account-${index}`}>
      <td>{index + 1}</td>
      <td>{account.site}</td>
      <td>{account.email}</td>
      <td>{account.pass}</td>
      <td>
        <FontAwesome
          name="trash"
          style={{ padding: '10px' }}
          onClick={() => {
            this.props.onRemoveAccount(account);
          }}
        />
      </td>
    </tr>
  );

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  getRandomProxy = () => {
    const proxies = this.state.proxies.split(/\n/);
    return proxies[Math.floor(Math.random() * proxies.length)];
  };

  awaitShopifyAccountChallenge = () => {
    ipcRenderer.on(RECEIVE_CAPTCHA_TOKEN, async (event, captchaToken) => {
      if (this.tokenIDs.includes(captchaToken.id) && captchaToken.type === 'shopify') {
        this.removeTokenFromTokenIDs(captchaToken.id);
        ipcRenderer.send(FINISH_SENDING_CAPTCHA_TOKEN, {});
        const payloadChallenge = {
          utf8: '✓',
          authenticity_token: captchaToken.authToken,
          'g-recaptcha-response': captchaToken.captchaResponse
        };
        const responseChallenge = await this.rp({
          method: 'POST',
          url: `${sites[this.state.site]}/account`,
          followRedirect: true,
          proxy: this.state.useProxies ? this.getRandomProxy() : '',
          resolveWithFullResponse: true,
          followAllRedirects: true,
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            pragma: 'no-cache',
            referrer: `${sites[this.state.site]}/challenge`,
            referrerPolicy: 'no-referrer-when-downgrade',
            'upgrade-insecure-requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
          },
          jar: this.cookieJars[captchaToken.id],
          form: payloadChallenge
        });
        console.log(responseChallenge);
        if (!responseChallenge.request.href.includes('register'))
          this.props.onCreateAccount({
            email: captchaToken.email,
            site: captchaToken.site,
            pass: captchaToken.pass,
            status: 'created'
          });
      }
    });
  };

  createShopifyAccount = async () => {
    const email = randomEmail({ domain: this.state.catchall });
    const pass = this.state.randomPassword ? randomize('a', 10) : this.state.password;
    const firstName = this.state.randomFirstLast ? random.first() : this.state.firstName;
    const lastName = this.state.randomFirstLast ? random.last() : this.state.lastName;
    const tokenID = uuidv4();
    this.tokenIDs.push(tokenID);
    this.cookieJars[tokenID] = request.jar();
    const payload = {
      form_type: ' create_customer',
      utf8: ' ✓',
      'customer[first_name]': firstName,
      'customer[last_name]': lastName,
      'customer[email]': email,
      'customer[password]': pass
    };
    const response = await this.rp({
      method: 'POST',
      url: `${sites[this.state.site]}/account`,
      followRedirect: true,
      proxy: this.state.useProxies ? this.getRandomProxy() : '',
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: this.cookieJars[tokenID],
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        referrer: `${sites[this.state.site]}/account/register`,
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      form: payload
    });
    if (response.request.href && response.request.href.includes('challenge')) {
      ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
      ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
        cookies: this.cookieJars[tokenID].getCookieString(sites[this.state.site]),
        checkoutURL: response.request.href,
        id: tokenID,
        type: 'shopify',
        proxy: this.state.useProxies ? this.getRandomProxy() : '',
        baseURL: sites[this.state.site],
        email: email,
        site: this.state.site,
        pass: pass
      });
    } else {
      if (!responseChallenge.request.href.includes('register')) {
        this.props.onCreateAccount({
          email: email,
          site: this.state.site,
          pass: pass,
          status: 'created'
        });
      }
    }
  };

  removeTokenFromTokenIDs = tokenID => {
    this.tokenIDs = this.tokenIDs.filter(token => token !== tokenID);
  };

  start = async () => {
    try {
      this.props.setLoading('Creating Accounts', true);
      this.tokenIDs = [];
      this.cookieJars = {};
      const accountPromises = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
        switch (this.state.site) {
          case 'sotostore':
            return this.createSotoStoreAccount();
          default:
            const delay = this.state.accountCreationDelay ? this.state.accountCreationDelayAmount : 0;
            return Promise.resolve(this.sleep(delay)).then(() => this.createShopifyAccount().catch(e => e));
        }
      });
      await Promise.all(accountPromises);
      const invalidResults = accountPromises.filter(result => result instanceof Error);
      if (invalidResults.length > 0) {
        this.props.changeInfoModal(
          true,
          `Error Creating Proxies On ${name}`,
          <Table>
            <thead>
              <tr>
                <th>Error Name</th>
                <th>Error Message</th>
              </tr>
            </thead>
            <tbody>
              {invalidResults.map((error, index) => {
                if (error.constructor.name === 'ApiError') {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.errors[0].reason}</td>
                      <td>{error.errors[0].message}</td>
                    </tr>
                  );
                } else if (error instanceof Error) {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.name}</td>
                      <td>{error.error ? error.error : error.message}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.id}</td>
                      <td>{error.message}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </Table>
        );
      }
    } catch (error) {
      console.log(error);
      this.props.changeInfoModal(
        true,
        'Error Creating Accounts',
        'There was an error creating the accounts you selected, you could try again or ask for support on the discord.',
        ''
      );
    } finally {
      this.props.setLoading('', false);
    }
    // for (let i = 0; i < parseInt(this.state.quantity); i++) {
    //   switch (this.state.site) {
    //     case 'sotostore':
    //       this.createSotoStoreAccount();
    //       break;
    //     default:
    //       await this.createShopifyAccount();
    //       if (this.state.accountCreationDelay) {
    //         await this.sleep(this.state.accountCreationDelayAmount);
    //       }
    //       break;
    //   }
    // }
  };

  copyToClipboard = () => {
    let string = '';
    this.props.accounts.accounts.forEach(elem => {
      string += `${elem.email} ${elem.pass}\n`;
    });
    clipboard.writeText(string, 'selection');
  };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // getSotoStoreToken = async captchaToken => {
  //   try {
  //     await this.rp({
  //       method: 'GET',
  //       url: 'https://www.sotostore.com/en/auth/view?op=register',
  //       headers: {
  //         Cookie: this.cookieJar.getCookieString('https://www.sotostore.com')
  //       },
  //       jar: this.cookieJar
  //     });
  //   } catch (error) {
  //     const $ = cheerio.load(error.error);
  //     const s = $('input[name="s"]').attr('value');
  //     const id = '4a280b22e8aa3572';
  //     const response = await this.rp({
  //       method: 'GET',
  //       resolveWithFullResponse: true,
  //       jar: this.cookieJar,
  //       url: `https://www.sotostore.com/cdn-cgi/l/chk_captcha?s=${s}id=${id}&g-recaptcha-response=${captchaToken}`
  //     });
  //     for (const cookie in response.headers['set-cookie']) {
  //       if (cookie.includes('AntiCsrfToken')) {
  //         return cookie.split('=')[1];
  //       }
  //     }
  //     console.log(response);
  //   }
  // };

  // createSotoStoreAccount = async () => {
  //   const tokenID = uuidv4();
  //   this.tokenIDs.push(tokenID);
  //   ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
  //   ipcRenderer.send(BOT_SEND_COOKIES_AND_CAPTCHA_PAGE, {
  //     cookies: '',
  //     checkoutURL: 'https://www.sotostore.com/en/auth/view',
  //     id: tokenID,
  //     proxy: this.state.useProxies ? this.getRandomProxy() : '',
  //     baseURL: 'https://www.sotostore.com/en/auth/view'
  //   });
  //   ipcRenderer.once(RECEIVE_CAPTCHA_TOKEN, async (event, captchaToken) => {
  //     if (captchaToken.id === tokenID) {
  //       ipcRenderer.send(FINISH_SENDING_CAPTCHA_TOKEN, {});
  //       captchaToken.cookies.split(';').forEach(cookiePair => {
  //         const splitCookie = cookiePair.split('=');
  //         let cart1Cookie = new tough.Cookie({
  //           key: splitCookie[0],
  //           value: splitCookie[1],
  //           domain: '.sotostore.com',
  //           path: '/'
  //         });
  //         this.cookieJar.setCookie(cart1Cookie.toString(), 'https://www.sotostore.com');
  //       });

  //       const antiCsrfToken = await this.getSotoStoreToken(captchaToken);
  //       const email = randomEmail({ domain: this.state.catchall });
  //       const pass = this.state.randomPassword ? randomize('a', 10) : this.state.password;
  //       const firstName = this.state.randomFirstLast ? random.first() : this.state.firstName;
  //       const lastName = this.state.randomFirstLast ? random.last() : this.state.lastName;
  //       const payload = {
  //         _AntiCsrfToken: antiCsrfToken,
  //         firstName: firstName,
  //         email: email,
  //         password: pass,
  //         'g-recaptcha-response': captchaToken.captchaResponse,
  //         action: 'register'
  //       };
  //       try {
  //         const response = await this.rp({
  //           method: 'POST',
  //           url: `${sites[this.state.site]}/account`,
  //           followRedirect: true,
  //           jar: this.cookieJar,
  //           proxy: this.state.useProxies ? this.getRandomProxy() : '',
  //           followAllRedirects: true,
  //           headers: {
  //             'cache-control': 'no-cache',
  //             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
  //           },
  //           form: payload
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   });
  // };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row className="d-flex flex-grow-1" style={{ maxHeight: '100%' }}>
              <Col xs="12" style={{ overflowY: 'scroll', marginBottom: '30px' }}>
                <Table responsive hover className="text-center">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>store</th>
                      <th>email</th>
                      <th>password</th>
                      <th>action</th>
                    </tr>
                  </thead>
                  <tbody>{this.props.accounts.accounts.map(this.returnAccountRow)}</tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col xs="1">
                <Label>Site</Label>
                <Input
                  name="site"
                  type="select"
                  onChange={e => {
                    this.handleChange(e);
                  }}
                  value={this.state.site}
                >
                  {this.returnOptions(Object.keys(sites), 'sites')}
                </Input>
              </Col>
              <Col xs="1">
                <Label>Qty</Label>
                <Input
                  onChange={e => {
                    this.handleChange(e);
                  }}
                  value={this.state.quantity}
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                />
              </Col>
              <Col xs="2">
                <Label>Catchall Domain</Label>
                <Input
                  onChange={e => {
                    this.handleChange(e);
                  }}
                  value={this.state.catchall}
                  name="catchall"
                  type="text"
                  placeholder="example.com"
                />
              </Col>
              <Col xs="2">
                <Label>Password</Label>
                <Input
                  onChange={e => {
                    this.handleChange(e);
                  }}
                  value={this.state.password}
                  name="password"
                  type="password"
                />
              </Col>
              <Col xs="1">
                <h6 style={{ fontWeight: 600 }}>Random Pass</h6>
                <Toggle
                  className="alignBottomToggle"
                  defaultChecked={this.state.randomPassword}
                  onChange={() => {
                    this.setState({ randomPassword: !this.state.randomPassword });
                  }}
                />
              </Col>
              <Col xs="1">
                <h6 style={{ fontWeight: 600 }}>Advanced</h6>
                <Toggle
                  className="alignBottomToggle"
                  defaultChecked={this.state.advancedSettings}
                  onChange={() => {
                    this.setState({ advancedSettings: !this.state.advancedSettings });
                  }}
                />
              </Col>
              <Col xs="4">
                <Button
                  style={{ margin: '5px' }}
                  onClick={() => {
                    this.start();
                  }}
                >
                  Start
                </Button>
                <Button
                  style={{ margin: '5px' }}
                  onClick={() => {
                    this.loadAllAccounts();
                  }}
                >
                  Load All
                </Button>
                <Button
                  style={{ margin: '5px' }}
                  onClick={() => {
                    this.copyToClipboard();
                  }}
                >
                  Copy All
                </Button>
                <Button color="danger" style={{ margin: '5px' }} onClick={this.toggleConfModal}>
                  Delete All
                </Button>
                <Button
                  color="danger"
                  style={{ margin: '5px' }}
                  onClick={() => {
                    ipcRenderer.send(RESET_CAPTCHA_WINDOW, 'reset');
                  }}
                >
                  Reload Captcha
                </Button>
              </Col>
            </Row>
            {this.state.advancedSettings ? (
              <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
                <Row style={{ paddingTop: '20px' }}>
                  <Col xs="1">
                    <h6 style={{ fontWeight: 600, marginBottom: '50px' }}>Proxies</h6>
                    <Toggle
                      className="alignBottomToggle"
                      defaultChecked={this.state.useProxies}
                      onChange={() => {
                        this.setState({ useProxies: !this.state.useProxies });
                      }}
                    />
                  </Col>
                  <Col xs="1">
                    <h6 style={{ fontWeight: 600 }}>Random Name</h6>
                    <Toggle
                      className="alignBottomToggle"
                      defaultChecked={this.state.randomFirstLast}
                      onChange={() => {
                        this.setState({ randomFirstLast: !this.state.randomFirstLast });
                      }}
                    />
                  </Col>
                  <Col xs="1">
                    <h6 style={{ fontWeight: 600 }}>Delay</h6>
                    <Toggle
                      className="alignBottomToggle"
                      defaultChecked={this.state.accountCreationDelay}
                      onChange={() => {
                        this.setState({ accountCreationDelay: !this.state.accountCreationDelay });
                      }}
                    />
                  </Col>
                  {this.state.useProxies ? (
                    <Col xs="3">
                      <Label>Proxies</Label>
                      <Input
                        onChange={e => {
                          this.handleChange(e);
                        }}
                        name="proxies"
                        type="textbox"
                      />
                    </Col>
                  ) : (
                    ''
                  )}
                  {!this.state.randomFirstLast ? (
                    <Col xs="2">
                      <Label>First Name</Label>
                      <Input
                        onChange={e => {
                          this.handleChange(e);
                        }}
                        name="firstName"
                        type="text"
                      />
                    </Col>
                  ) : (
                    ''
                  )}
                  {!this.state.randomFirstLast ? (
                    <Col xs="2">
                      <Label>Last Name</Label>
                      <Input
                        onChange={e => {
                          this.handleChange(e);
                        }}
                        name="lastName"
                        type="text"
                      />
                    </Col>
                  ) : (
                    ''
                  )}
                  {this.state.accountCreationDelay ? (
                    <Col xs="2">
                      <Label>Delay Amount (ms)</Label>
                      <Input
                        name="accountCreationDelayAmount"
                        value={this.state.accountCreationDelayAmount}
                        onChange={e => {
                          this.handleChange(e);
                        }}
                        type="number"
                      />
                    </Col>
                  ) : (
                    ''
                  )}
                </Row>
              </CSSTransition>
            ) : (
              ''
            )}
          </Container>
          <Modal isOpen={this.state.confModal} toggle={this.toggleConfModal} centered={true}>
            <ModalHeader toggle={this.toggleConfModal} style={{ borderBottom: 'none' }}>
              Delete All Accounts?
            </ModalHeader>
            <ModalBody>Are you sure you want to delete all the accounts you have previously generated using Neutrino?</ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggleConfModal}>
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={() => {
                  this.props.onRemoveAllAccounts();
                  this.setState({ createdAccount: [] });
                  this.toggleConfModal();
                }}
              >
                Delete All
              </Button>
            </ModalFooter>
          </Modal>
        </Col>
      </CSSTransition>
    );
  }
}
