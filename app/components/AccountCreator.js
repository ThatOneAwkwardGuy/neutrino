import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Toggle from 'react-toggle';
const randomEmail = require('random-email');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');
var tough = require('tough-cookie');

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

    this.rp = request;
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

    const payload = {
      form_type: ' create_customer',
      utf8: ' ✓',
      'customer[first_name]': 'Moyo',
      'customer[last_name]': 'George',
      'customer[email]': 'xtremexx_11@hotmail.com1',
      'customer[password]': 'test',
      undefined: undefined
    };

    console.log(payload);

    try {
      const response = await this.rp({
        method: 'POST',
        url: 'https://undefeated.com/account',
        followRedirect: true,
        jar: true,
        headers: {
          'cache-control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        },
        form: payload
      });
      console.log(response);
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
