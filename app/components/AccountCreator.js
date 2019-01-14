import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Toggle from 'react-toggle';
const randomEmail = require('random-email');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');

const sites = {
  undefeated: 'https://undefeated.com',
  xhibition: 'https://www.xhibition.co',
  cncpts: 'https://cncpts.com',
  bdgastore: 'https://bdgastore.com'
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
      quantity: '',
      catchall: '',
      password: '',
      firstName: '',
      lastName: ''
    };
    // fetch('https://undefeated.com/account', {
    //   credentials: 'include',
    //   headers: {
    //     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    //     'accept-language': 'en-US,en;q=0.9',
    //     'cache-control': 'no-cache',
    //     'content-type': 'application/x-www-form-urlencoded',
    //     pragma: 'no-cache',
    //     'upgrade-insecure-requests': '1'
    //   },
    //   referrer: 'https://undefeated.com/account/login',
    //   referrerPolicy: 'no-referrer-when-downgrade',
    //   body:
    //     'form_type=create_customer&utf8=%E2%9C%93&customer%5Bfirst_name%5D=Moyo&customer%5Blast_name%5D=George&customer%5Bemail%5D=dadux%40youmails.online&customer%5Bpassword%5D=asdasdasd',
    //   method: 'POST',
    //   mode: 'cors'
    // });

    this.rp = request.defaults({
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        referrer: 'https://undefeated.com/account/login',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      }
    });
  }

  returnOptions = (optionsArray, name) => {
    return optionsArray.map((elem, index) => <option key={`option-${name}-${index}`}>{elem}</option>);
  };

  returnAccountRow = (optionsArray, index) => (
    <tr key={`account-${index}`}>
      <td>test</td>
      <td>test</td>
      <td>test</td>
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
    let cookieJar = request.jar();
    const payload = {
      form_type: 'create_customer',
      utf8: '✓',
      'customer[first_name]': firstName,
      'customer[last_name]': lastName,
      'customer[email]': 'dadux@youmails.online',
      'customer[password]': pass
    };

    const payloadString = `form_type=create_customer&utf8=%E2%9C%93&customer%5Bfirst_name%5D=${firstName}&customer%5Blast_name%5D=${lastName}&customer%5Bemail%5D=${email.replace(
      '@',
      '%40'
    )}&customer%5Bpassword%5D=${pass}`;

    console.log(payload);

    try {
      const response1 = await this.rp({
        method: 'GET',
        uri: `${sites[this.state.site]}/account`,
        proxy: this.state.proxies ? this.getRandomProxy() : '',
        followAllRedirects: true,
        resolveWithFullResponse: true,
        cookie: cookieJar
      });
      console.log(response1);

      const response2 = await this.rp({
        proxy: this.state.proxies ? this.getRandomProxy() : '',
        method: 'POST',
        uri: `${sites[this.state.site]}/account`,
        form: payload,
        followAllRedirects: true,
        resolveWithFullResponse: true,
        cookie: cookieJar
      });
      console.log(response2);
    } catch (error) {
      console.log(error);
    }
  };

  start = async () => {
    if (Object.keys(sites).includes(this.state.site)) {
      for (let i = 0; i < this.state.quantity; i++) {
        await this.createShopifyAccount();
      }
    }
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row className="d-flex flex-grow-1">
              <Col xs="12">
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
              <Col xs="2">
                <Button
                  onClick={() => {
                    this.start();
                  }}
                >
                  Start
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
