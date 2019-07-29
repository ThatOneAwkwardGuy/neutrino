/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  Button,
  CustomInput
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { withToastManager } from 'react-toast-notifications';
import Table from '../Table/index';
import { sites } from '../../constants/constants';
import { upperCaseFirst, createNewWindow } from '../../utils/utils';
import { getCaptchaResponse } from '../../screens/Captcha/functions';
import { getFormData } from './functions';

const { clipboard } = require('electron');

const randomEmail = require('random-email');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');
const uuidv4 = require('uuid/v4');

class AccountCreator extends Component {
  constructor(props) {
    super(props);
    this.cookieJars = {};
    this.state = {
      advancedSettings: false,
      randomPass: false,
      randomName: false,
      useProxies: false,
      delay: '2000',
      site: '',
      quantity: '1',
      catchall: '',
      pass: '',
      firstName: '',
      lastName: '',
      proxies: ''
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleToggleChange = e => {
    const { name } = e.target;
    this.setState(prevState => ({
      [name]: !prevState[name]
    }));
  };

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  returnSiteOption = site => (
    <option value={site}>{upperCaseFirst(site)}</option>
  );

  toggleAdvancedSettings = () => {
    this.setState(prevState => ({
      advancedSettings: !prevState.advancedSettings
    }));
  };

  createAccounts = async () => {
    const { site, delay, quantity } = this.state;
    const { setLoading, incrementAccounts } = this.props;
    const accountPromises = Array.from(Array(parseInt(quantity, 10))).map(
      () => {
        switch (site) {
          case 'nakedcph':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createNakedCphAccount().catch(e => e)
            );
          case 'oneblockdown':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createOneBlockDownAccount().catch(e => e)
            );
          default:
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createShopifyAccount().catch(e => e)
            );
        }
      }
    );
    console.log(accountPromises);
    setLoading(
      true,
      `Creating ${quantity} ${upperCaseFirst(site)} Account(s)`,
      true
    );
    const resolvedPromises = await Promise.all(accountPromises);
    setLoading(
      false,
      `Creating ${quantity} ${upperCaseFirst(site)} Account(s)`,
      true
    );
    const successes = resolvedPromises.filter(
      promise => !(promise instanceof Error)
    );
    successes.forEach(() => incrementAccounts());
  };

  copyAllAccounts = () => {
    const { accounts, toastManager } = this.props;
    let string = '';
    accounts.accounts.forEach(elem => {
      string += `${elem.email}:${elem.pass}\n`;
    });
    clipboard.writeText(string, 'selection');
    toastManager.add('Jigged addresses copied to clipboard', {
      appearance: 'success',
      autoDismiss: true,
      pauseOnHover: true
    });
  };

  getRandomProxy = () => {
    const { proxies } = this.state;
    const proxiesArray = proxies.split(/\n/);
    return proxiesArray[Math.floor(Math.random() * proxiesArray.length)];
  };

  createOneBlockDownAccount = async () => {
    const {
      randomPass,
      randomName,
      useProxies,
      site,
      catchall,
      pass,
      firstName,
      lastName
    } = this.state;
    const { addCreatedAccount } = this.props;
    const email = randomEmail({ domain: catchall });
    const accountPass = randomPass ? randomize('a', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const response = await request({
      method: 'POST',
      uri: 'https://www.oneblockdown.it/index.php',
      proxy: useProxies ? `http://${this.getRandomProxy()}` : '',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        pragma: 'no-cache',
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        controller: 'auth',
        action: 'register',
        extension: 'obd',
        email,
        password: accountPass,
        accountFirstName,
        accountLastName,
        birthDate: '1990-4-7',
        sex: 'MALE',
        'privacy[1]': '1',
        'privacy[2]': '0',
        version: '106'
      }
    });
    const responseJSON = JSON.parse(response);
    if (responseJSON.success) {
      addCreatedAccount({
        email,
        site,
        pass,
        status: 'created'
      });
    }
  };

  createShopifyAccount = async () => {
    const {
      randomPass,
      randomName,
      useProxies,
      site,
      catchall,
      pass,
      firstName,
      lastName
    } = this.state;
    const { addCreatedAccount } = this.props;
    const email = randomEmail({ domain: catchall });
    const accountPass = randomPass ? randomize('a', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const tokenID = uuidv4();
    this.cookieJars[tokenID] = request.jar();
    const payload = {
      form_type: 'create_customer',
      utf8: '✓',
      'customer[first_name]': accountFirstName,
      'customer[last_name]': accountLastName,
      'customer[email]': email,
      'customer[password]': accountPass
    };
    const queryString = new URLSearchParams(getFormData(payload)).toString();
    const response = await request({
      method: 'POST',
      url: `${sites[site]}/account`,
      followRedirect: true,
      proxy: useProxies ? `http://${this.getRandomProxy()}` : '',
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: this.cookieJars[tokenID],
      headers: {
        authority: 'cncpts.com',
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        origin: sites[site],
        'upgrade-insecure-requests': '1',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        referer: `${sites[site]}/account/login`,
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9'
      },
      body: queryString
    });
    if (response.request.href && response.request.href.includes('challenge')) {
      const captchaResponse = await getCaptchaResponse({
        cookiesObject: this.cookieJars[tokenID]._jar.store.idx,
        url: response.request.href,
        id: tokenID,
        proxy: useProxies ? this.getRandomProxy() : '',
        baseURL: sites[site],
        site,
        accountPass
      });
      const payloadChallenge = {
        utf8: '✓',
        authenticity_token: captchaResponse.authToken,
        'g-recaptcha-response': captchaResponse.captchaToken
      };
      await request({
        method: 'POST',
        url: `${sites[site]}/account`,
        followRedirect: true,
        proxy: useProxies ? this.getRandomProxy() : '',
        resolveWithFullResponse: true,
        followAllRedirects: true,
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
          pragma: 'no-cache',
          referrer: `${sites[site]}/challenge`,
          referrerPolicy: 'no-referrer-when-downgrade',
          'upgrade-insecure-requests': '1',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36'
        },
        jar: this.cookieJars[captchaResponse.id],
        form: payloadChallenge
      });
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
      return;
    }
    if (!response.request.href.includes('register')) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    }
  };

  createNakedCphAccount = async () => {
    const {
      randomPass,
      randomName,
      useProxies,
      site,
      catchall,
      pass,
      firstName,
      lastName
    } = this.state;
    const { addCreatedAccount } = this.props;
    return new Promise(async (resolve, reject) => {
      const email = randomEmail({ domain: catchall });
      const accountPass = randomPass ? randomize('a', 10) : pass;
      const accountFirstName = randomName ? random.first() : firstName;
      const accountLastName = randomName ? random.last() : lastName;
      const tokenID = uuidv4();
      const proxy = useProxies ? `http://${this.getRandomProxy()}` : '';
      const window = await createNewWindow(tokenID, proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL('https://www.nakedcph.com/auth/view?op=register');
      window.webContents.on('did-finish-load', () => {
        window.webContents.executeJavaScript(
          `
        document.getElementById('firstNameInput').value = '${accountFirstName} ${accountLastName}';
        document.getElementById('emailInput').value = '${email}';
        document.getElementById('passwordInput').value = '${accountPass}';
        document.querySelector('button[type="submit"]').click();
        `,
          false,
          () => {
            window.webContents.on('did-finish-load', () => {
              window.webContents.executeJavaScript(
                'window.location',
                false,
                result => {
                  if (result.pathname === '/auth/success') {
                    window.webContents.removeAllListeners('close', () => {});
                    addCreatedAccount({
                      email,
                      site,
                      pass,
                      status: 'created'
                    });
                    window.close();
                    resolve();
                  }
                }
              );
            });
          }
        );
      });
    });
  };

  render() {
    const {
      site,
      quantity,
      catchall,
      pass,
      proxies,
      advancedSettings,
      randomPass,
      randomName,
      useProxies,
      firstName,
      lastName
    } = this.state;
    const { accounts, removeAllCreatedAccounts } = this.props;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Store',
        accessor: 'site'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Password',
        accessor: 'pass'
      }
    ];
    return (
      <Row className="h-100 p-0">
        <Col className="h-100" xs="12">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: accounts.accounts,
                    columns,
                    loading: false,
                    infinite: true,
                    manualSorting: false,
                    manualFilters: false,
                    manualPagination: false,
                    disableMultiSort: true,
                    disableGrouping: true,
                    debug: false
                  }}
                />
              </Col>
            </Row>
            <Row className="pt-1 align-items-end noselect">
              <Col className="text-right">
                <FontAwesomeIcon
                  icon="cog"
                  onClick={this.toggleAdvancedSettings}
                />
              </Col>
            </Row>
            {!advancedSettings ? (
              <Row className="py-3 align-items-end noselect">
                <Col>
                  <Label>Site*</Label>
                  <Input
                    type="select"
                    name="site"
                    value={site}
                    onChange={this.handleChange}
                  >
                    <option key="site-disabled" value="disabled">
                      Select a site
                    </option>
                    {Object.keys(sites).map(this.returnSiteOption)}
                  </Input>
                </Col>
                {!randomPass ? (
                  <Col>
                    <Label>Password*</Label>
                    <Input
                      type="text"
                      name="pass"
                      value={pass}
                      onChange={this.handleChange}
                    />
                  </Col>
                ) : null}
                {!randomName ? (
                  <Col>
                    <Label>First Name*</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={this.handleChange}
                    />
                  </Col>
                ) : null}
                <Col>
                  <Button onClick={this.createAccounts}>Start</Button>
                </Col>
                <Col>
                  <Button onClick={this.copyAllAccounts}>Copy All</Button>
                </Col>
              </Row>
            ) : (
              <Row className="py-3 align-items-end noselect">
                <Col xs="4">
                  <Container fluid>
                    <Row className="py-3">
                      <Col>
                        <Label>Random Password</Label>
                        <CustomInput
                          type="switch"
                          id="randomPass"
                          name="randomPass"
                          checked={randomPass}
                          onChange={this.handleToggleChange}
                        />
                      </Col>
                      <Col>
                        <Label>Random Name</Label>
                        <CustomInput
                          type="switch"
                          id="randomName"
                          name="randomName"
                          checked={randomName}
                          onChange={this.handleToggleChange}
                        />
                      </Col>
                    </Row>
                    <Row className="py-3">
                      <Col>
                        <Label>Proxies</Label>
                        <CustomInput
                          type="switch"
                          id="useProxies"
                          name="useProxies"
                          checked={useProxies}
                          onChange={this.handleToggleChange}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Col>
                <Col xs="8" className="h-100">
                  <Label>Proxies</Label>
                  <Input
                    name="proxies"
                    type="textarea"
                    rows="4"
                    value={proxies}
                    onChange={this.handleChange}
                    placeholder="ip:port or ip:port:user:pass"
                  />
                </Col>
              </Row>
            )}
            {!advancedSettings ? (
              <Row className="py-3 align-items-end noselect">
                <Col>
                  <Label>Quantity*</Label>
                  <Input
                    type="number"
                    name="quantity"
                    min="0"
                    value={quantity}
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>Catchall*</Label>
                  <Input
                    type="text"
                    name="catchall"
                    placeholder="example.com"
                    value={catchall}
                    onChange={this.handleChange}
                  />
                </Col>
                {!randomName ? (
                  <Col>
                    <Label>Last Name*</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={this.handleChange}
                    />
                  </Col>
                ) : null}
                <Col>
                  <Button color="danger" onClick={removeAllCreatedAccounts}>
                    Delete All
                  </Button>
                </Col>
              </Row>
            ) : null}
          </Container>
        </Col>
      </Row>
    );
  }
}

AccountCreator.propTypes = {
  addCreatedAccount: PropTypes.func.isRequired,
  removeAllCreatedAccounts: PropTypes.func.isRequired,
  accounts: PropTypes.shape({
    accounts: PropTypes.array
  }).isRequired,
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired,
  setLoading: PropTypes.func.isRequired,
  incrementAccounts: PropTypes.func.isRequired
};

export default withToastManager(AccountCreator);
