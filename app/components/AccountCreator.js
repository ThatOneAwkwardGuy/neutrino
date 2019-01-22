import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Toggle from 'react-toggle';
const randomEmail = require('random-email');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');
const { clipboard } = require('electron');

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
  sotostore: 'https://www.sotostore.com',
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
  xhibition: 'https://www.xhibition.co'
};

const captcha = {
  undefeated: true,
  xhibition: true,
  cncpts: false,
  bdgastore: false
};

export default class AccountCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      randomPassword: false,
      randomFirstLast: true,
      useProxies: false,
      createdAccount: [],
      site: Object.keys(sites)[0],
      quantity: '1',
      catchall: '',
      password: '',
      firstName: '',
      lastName: ''
    };

    this.rp = request.defaults({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      }
    });
  }

  returnOptions = (optionsArray, name) => {
    return optionsArray.map((elem, index) => <option key={`option-${name}-${index}`}>{elem}</option>);
  };

  returnAccountRow = (account, index) => (
    <tr key={`account-${index}`}>
      <td>{index + 1}</td>
      <td>{account.email}</td>
      <td>{account.pass}</td>
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

  createShopifyAccount = async () => {
    const email = randomEmail({ domain: this.state.catchall });
    const pass = this.state.randomPassword ? randomize('a', 10) : this.state.password;
    const firstName = this.state.randomFirstLast ? random.first() : this.state.firstName;
    const lastName = this.state.randomFirstLast ? random.last() : this.state.lastName;

    const payload = {
      form_type: ' create_customer',
      utf8: ' ✓',
      'customer[first_name]': firstName,
      'customer[last_name]': lastName,
      'customer[email]': email,
      'customer[password]': pass
    };

    try {
      const response = await this.rp({
        method: 'POST',
        url: `${sites[this.state.site]}/account`,
        followRedirect: true,
        jar: true,
        proxy: this.state.useProxies ? this.getRandomProxy() : '',
        followAllRedirects: true,
        headers: {
          'cache-control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        },
        form: payload
      });
      if (captcha[this.state.site]) {
      } else {
        this.setState({
          createdAccount: [
            ...this.state.createdAccount,
            {
              email: email,
              pass: pass
            }
          ]
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  start = async () => {
    if (Object.keys(sites).includes(this.state.site)) {
      for (let i = 0; i < parseInt(this.state.quantity); i++) {
        await this.createShopifyAccount();
      }
    }
  };

  copyToClipboard = () => {
    let string = '';
    this.state.createdAccount.forEach(elem => {
      string += `${elem.email} ${elem.pass}\n`;
    });
    clipboard.writeText(string, 'selection');
  };

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
                      <th>email</th>
                      <th>password</th>
                    </tr>
                  </thead>
                  <tbody>{this.state.createdAccount.map(this.returnAccountRow)}</tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col xs="2">
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
                <h6 style={{ fontWeight: 600 }}>Proxies</h6>
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
                <Button
                  onClick={() => {
                    this.start();
                  }}
                >
                  Start
                </Button>
              </Col>
              <Col xs="1">
                <Button
                  onClick={() => {
                    this.copyToClipboard();
                  }}
                >
                  copy
                </Button>
              </Col>
            </Row>
            {this.state.proxies || !this.state.randomFirstLast ? (
              <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
                <Row style={{ paddingTop: '20px' }}>
                  {this.state.proxies ? (
                    <Col xs="6">
                      <Label>proxies</Label>
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
                    <Col xs="3">
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
                    <Col xs="3">
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
                </Row>
              </CSSTransition>
            ) : (
              ''
            )}
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
