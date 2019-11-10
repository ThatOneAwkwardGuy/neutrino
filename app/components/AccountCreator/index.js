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
import { withToastManager } from 'react-toast-notifications';
import { Tooltip } from 'react-tippy';

import PropTypes from 'prop-types';

import Table from '../Table/index';

import { sites } from '../../constants/constants';
import {
  upperCaseFirst,
  createNewWindow,
  generateRandomNLengthString
} from '../../utils/utils';
import { getCaptchaResponse } from '../../screens/Captcha/functions';
import { getFormData } from './functions';
import {
  getRandomInt,
  generateGmailDotTrick
} from '../ProfileCreator/functions';

const { clipboard } = require('electron');
const { dialog } = require('electron').remote;

const fsPromises = require('fs').promises;
const cheerio = require('cheerio');
const randomize = require('randomatic');
const request = require('request-promise');
const random = require('random-name');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

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
      proxies: '',
      emails: []
    };
  }

  loadEmails = () => {
    dialog.showOpenDialog(
      null,
      {
        filters: [{ name: 'Emails Text File', extensions: ['txt'] }]
      },
      async filePaths => {
        const filePath = filePaths[0];
        const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
        if (filePath.split('.').slice(-1)[0] === 'txt') {
          const emails = file.split('\n');
          this.setState({ emails, quantity: emails.length });
        }
      }
    );
  };

  clearEmails = () => {
    this.setState({
      emails: [],
      quantity: 1
    });
  };

  exportAccountsAsProfiles = () => {
    const { accounts, profile, cards } = this.props;
    const selectedCard =
      cards.length === 0
        ? {
            paymentCardholdersName: '',
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvv: ''
          }
        : cards[Math.floor(Math.random() * cards.length)];
    const accountFirstName = profile.randomNameBool
      ? random.first()
      : profile.deliveryFirstName;
    const accountLastName = profile.randomNameBool
      ? random.last()
      : profile.deliveryLastName;
    const profiles = accounts.accounts.map(account => ({
      profileID: `${account.site}-${account.email}`,
      deliveryCountry: profile.deliveryCountry,
      deliveryAddress: profile.deliveryAddress,
      deliveryCity: profile.deliveryCity,
      deliveryFirstName: accountFirstName,
      deliveryLastName: accountLastName,
      deliveryRegion: profile.deliveryRegion,
      deliveryZip: profile.deliveryZip,
      deliveryApt: profile.deliveryApt,
      billingZip: profile.billingZip,
      billingCountry: profile.billingCountry,
      billingAddress: profile.billingAddress,
      billingCity: profile.billingCity,
      billingFirstName: profile.billingFirstName,
      billingLastName: profile.billingLastName,
      billingRegion: profile.billingRegion,
      billingApt: profile.billingApt,
      phone:
        profile.randomPhoneNumberBool &&
        profile.randomPhoneNumberTemplate !== ''
          ? profile.randomPhoneNumberTemplate
              .split('#')
              .map(number => (number === '' ? getRandomInt(9) : number))
              .join('')
          : profile.phone,
      card: selectedCard,
      email: account.email,
      password: account.pass,
      sameDeliveryBillingBool: profile.sameDeliveryBillingBool,
      oneCheckoutBool: profile.oneCheckoutBool,
      randomNameBool: profile.randomNameBool,
      randomPhoneNumberBool: profile.randomPhoneNumberBool,
      useCatchallBool: profile.useCatchallBool,
      jigAddressesBool: profile.jigAddressesBool,
      fourCharPrefixBool: profile.fourCharPrefixBool
    }));
    dialog.showSaveDialog(
      {
        title: 'name',
        defaultPath: `~/Account-Generator-Neutrino-Profiles.json`
      },
      fileName => {
        if (fileName === undefined) {
          return;
        }
        fs.writeFile(fileName, JSON.stringify(profiles), () => {});
      }
    );
  };

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
    const { catchall, site, delay, quantity, emails } = this.state;
    const { setLoading, incrementAccounts, setInfoModal } = this.props;
    let gmailEmails = [];
    if (catchall.includes('@gmail')) {
      gmailEmails = generateGmailDotTrick(quantity, catchall);
    } else if (emails.length > 0) {
      gmailEmails = emails;
    }
    const accountPromises = Array.from(Array(parseInt(quantity, 10))).map(
      (value, index) => {
        switch (site) {
          case 'nakedcph':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createNakedCphAccount(gmailEmails[index]).catch(e => e)
            );
          case 'stress95':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createStress95Account(gmailEmails[index]).catch(e => e)
            );
          case 'oneblockdown':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createOneBlockDownAccount(gmailEmails[index]).catch(e => e)
            );
          default:
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createShopifyAccount(gmailEmails[index]).catch(e => e)
            );
        }
      }
    );
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
    const failures = resolvedPromises.filter(
      promise => promise instanceof Error
    );
    if (failures.length > 0) {
      setInfoModal({
        infoModalShowing: true,
        infoModalHeader: `Errors creating accounts`,
        infoModalBody: (
          <table className="w-100">
            <th>
              <tr>
                <td>Errors</td>
              </tr>
            </th>
            <tbody>
              {failures.map(error => (
                <tr>
                  <td>{JSON.stringify(error.message)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ),
        infoModalFunction: '',
        infoModalButtonText: ''
      });
    }
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
    const randomProxy =
      proxiesArray[Math.floor(Math.random() * proxiesArray.length)];
    const splitRandomProxy =
      randomProxy !== undefined ? randomProxy.split(':') : undefined;
    if (splitRandomProxy === undefined) {
      return '';
    }
    if (splitRandomProxy.length === 2) {
      return `http://${splitRandomProxy[0]}:${splitRandomProxy[1]}`;
    }
    if (splitRandomProxy.length === 4) {
      return `http://${splitRandomProxy[2]}:${splitRandomProxy[3]}@${
        splitRandomProxy[0]
      }:${splitRandomProxy[1]}`;
    }
  };

  createOneBlockDownAccount = async gmailEmail => {
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
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
    const accountPass = randomPass ? randomize('a', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const tokenID = uuidv4();
    this.cookieJars[tokenID] = request.jar();
    const response = await request({
      method: 'POST',
      uri: 'https://eu.oneblockdown.it/account',
      proxy: useProxies ? this.getRandomProxy() : '',
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Language': 'en-US,en;q=0.9',
        Authority: 'eu.oneblockdown.it',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        Pragma: 'no-cache',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
      },
      jar: this.cookieJars[tokenID],
      resolveWithFullResponse: true,
      followAllRedirects: true,
      body: `form_type=create_customer&utf8=%E2%9C%93&customer%5Bfirst_name%5D=${accountFirstName}&customer%5Blast_name%5D=${accountLastName}&customer%5Bemail%5D=${encodeURIComponent(
        email
      )}&customer%5Bpassword%5D=${accountPass}&customer%5Btags%5D=gender_man`
    });
    if (response.request.href && response.request.href.includes('challenge')) {
      const regex = /sitekey: "(.*)"/gm;
      const siteKey = regex.exec(response.body)[1];
      const captchaResponse = await getCaptchaResponse({
        cookiesObject: this.cookieJars[tokenID]._jar.store.idx,
        url: response.request.href,
        id: tokenID,
        proxy: useProxies ? this.getRandomProxy() : '',
        baseURL: sites[site],
        site,
        accountPass,
        settings,
        siteKey
      });
      let authToken;
      if (settings.CaptchaAPI !== '') {
        const $ = cheerio.load(response.body);
        authToken = $('input[name="authenticity_token"]').attr('value');
      }

      const payloadChallenge = {
        authenticity_token:
          settings.CaptchaAPI !== '' ? authToken : captchaResponse.authToken,
        'g-recaptcha-response': captchaResponse.captchaToken
      };

      await request({
        method: 'POST',
        url: `https://eu.oneblockdown.it/account`,
        followRedirect: true,
        proxy: useProxies ? this.getRandomProxy() : '',
        resolveWithFullResponse: true,
        followAllRedirects: true,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'Accept-Language': 'en-US,en;q=0.9',
          Authority: 'eu.oneblockdown.it',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          Pragma: 'no-cache',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
        },
        jar:
          settings.CaptchaAPI !== ''
            ? this.cookieJars[tokenID]
            : this.cookieJars[captchaResponse.id],
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

  createShopifyAccount = async gmailEmail => {
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
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
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
      proxy: useProxies ? this.getRandomProxy() : '',
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: this.cookieJars[tokenID],
      headers: {
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        origin: sites[site],
        'upgrade-insecure-requests': '1',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        referer: `${sites[site]}/account/login`,
        'accept-language': 'en-US,en;q=0.9'
      },
      body: queryString
    });

    if (response.request.href && response.request.href.includes('challenge')) {
      const regex = /sitekey: "(.*)"/gm;
      const siteKey = regex.exec(response.body)[1];
      const captchaResponse = await getCaptchaResponse({
        cookiesObject: this.cookieJars[tokenID]._jar.store.idx,
        url: response.request.href,
        id: tokenID,
        proxy: useProxies ? this.getRandomProxy() : '',
        baseURL: sites[site],
        site,
        accountPass,
        settings,
        siteKey
      });

      let authToken;
      if (settings.CaptchaAPI !== '') {
        const $ = cheerio.load(response.body);
        authToken = $('input[name="authenticity_token"]').attr('value');
      }

      await request({
        method: 'POST',
        url: `${sites[site]}/account`,
        followRedirect: true,
        proxy: useProxies ? this.getRandomProxy() : '',
        resolveWithFullResponse: true,
        followAllRedirects: true,
        headers: {
          authority: 'undefeated.com',
          pragma: 'no-cache',
          'cache-control': 'no-cache',
          origin: 'https://undefeated.com',
          'upgrade-insecure-requests': '1',
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-user': '?1',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'sec-fetch-site': 'same-origin',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'en-US,en;q=0.9',
          referrer: `${sites[site]}/challenge`
        },
        jar:
          settings.CaptchaAPI !== ''
            ? this.cookieJars[tokenID]
            : this.cookieJars[captchaResponse.id],
        body: `authenticity_token=${
          settings.CaptchaAPI !== '' ? authToken : captchaResponse.authToken
        }&g-recaptcha-response=${captchaResponse.captchaToken}`
      });

      if (!response.body.includes('Email contains an invalid domain name')) {
        addCreatedAccount({
          email,
          site,
          pass: accountPass,
          status: 'created'
        });
        return;
      }
      return new Error(
        'There was an error creating your account. this could be due to a banned catchall'
      );
    }
    if (
      !response.request.href.includes('register') &&
      !response.body.includes('Email contains an invalid domain name')
    ) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    }
  };

  createNakedCphAccount = async gmailEmail => {
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
      const email =
        gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
      const accountPass = randomPass ? randomize('a', 10) : pass;
      const accountFirstName = randomName ? random.first() : firstName;
      const accountLastName = randomName ? random.last() : lastName;
      const tokenID = uuidv4();
      const proxy = useProxies ? this.getRandomProxy() : '';

      const window = await createNewWindow(tokenID, proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL('http://www.nakedcph.com/auth/view?op=register');
      window.webContents.on('did-finish-load', async () => {
        const botOrNotPage = await window.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
          false
        );
        if (!botOrNotPage.includes('BOT or NOT?!')) {
          await window.webContents.executeJavaScript(
            `
          document.getElementById('firstNameInput').value = '${accountFirstName} ${accountLastName}';
          document.getElementById('emailInput').value = '${email}';
          document.getElementById('passwordInput').value = '${accountPass}';
          document.querySelector('button[type="submit"]').click();
          `,
            false
          );
          window.webContents.once('did-finish-load', async () => {
            const result = await window.webContents.executeJavaScript(
              'document.documentElement.innerHTML',
              false
            );
            if (result.includes('Account created!')) {
              window.webContents.removeAllListeners('close', () => {});
              addCreatedAccount({
                email,
                site,
                pass: accountPass,
                status: 'created'
              });
              resolve();
            } else {
              reject(new Error('Couldnt tell if account was created'));
            }
            window.close();
          });
        }
      });
    });
  };

  createStress95Account = async gmailEmail => {
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
      const email =
        gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
      const accountPass = randomPass ? randomize('a', 10) : pass;
      const accountFirstName = randomName ? random.first() : firstName;
      const accountLastName = randomName ? random.last() : lastName;
      const tokenID = uuidv4();
      const proxy = useProxies ? this.getRandomProxy() : '';
      const window = await createNewWindow(tokenID, proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL('https://stress95.com/en/auth/view?op=register');
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
                'document.documentElement.innerHTML',
                false,
                result => {
                  if (result.includes('Account created!')) {
                    window.webContents.removeAllListeners('close', () => {});
                    addCreatedAccount({
                      email,
                      site,
                      pass: accountPass,
                      status: 'created'
                    });
                    resolve();
                  } else {
                    reject(new Error('Couldnt tell if account was created'));
                  }
                  window.close();
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
      <Row className="h-100">
        <Col className="h-100">
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
                  <Label>
                    Site*{' '}
                    <Tooltip
                      arrow
                      distance={20}
                      title="The site you want to create accounts on."
                    >
                      <FontAwesomeIcon icon="question-circle" />
                    </Tooltip>
                  </Label>
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
                    <Label>
                      Password*{' '}
                      <Tooltip
                        arrow
                        distance={20}
                        title="The password you want to use for the accounts you will be generating."
                      >
                        <FontAwesomeIcon icon="question-circle" />
                      </Tooltip>
                    </Label>
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
                    <Label>
                      First Name*{' '}
                      <Tooltip
                        arrow
                        distance={20}
                        title="The first name you want to use for the accounts you will be generating."
                      >
                        <FontAwesomeIcon icon="question-circle" />
                      </Tooltip>
                    </Label>
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
                <Col>
                  <Button onClick={this.exportAccountsAsProfiles}>
                    Export as Profiles
                  </Button>
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
                  <Label>
                    Quantity*{' '}
                    <Tooltip
                      arrow
                      distance={20}
                      title="The number of accounts you want to create."
                    >
                      <FontAwesomeIcon icon="question-circle" />
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    name="quantity"
                    min="0"
                    value={quantity}
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>
                    Catchall*{' '}
                    <Tooltip
                      arrow
                      distance={20}
                      title="The catchall you will be using to create accounts. If you do no know what a catchall is, read the guide."
                    >
                      <FontAwesomeIcon icon="question-circle" />
                    </Tooltip>
                  </Label>
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
                    <Label>
                      Last Name*{' '}
                      <Tooltip
                        arrow
                        distance={20}
                        title="The last name you want to use for the accounts you will be generating."
                      >
                        <FontAwesomeIcon icon="question-circle" />
                      </Tooltip>
                    </Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={this.handleChange}
                    />
                  </Col>
                ) : null}
                <Col>
                  <Button onClick={this.loadEmails}>Load Emails</Button>
                </Col>
                <Col>
                  <Button onClick={this.clearEmails}>Clear Emails</Button>
                </Col>
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
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired,
  setLoading: PropTypes.func.isRequired,
  incrementAccounts: PropTypes.func.isRequired,
  setInfoModal: PropTypes.func.isRequired,
  cards: PropTypes.arrayOf(PropTypes.any).isRequired,
  profile: PropTypes.shape({
    sameDeliveryBillingBool: PropTypes.bool.isRequired,
    oneCheckoutBool: PropTypes.bool.isRequired,
    jigAddressesBool: PropTypes.bool.isRequired,
    fourCharPrefixBool: PropTypes.bool.isRequired,
    randomNameBool: PropTypes.bool.isRequired,
    randomPhoneNumberBool: PropTypes.bool.isRequired,
    useCatchallBool: PropTypes.bool.isRequired,
    deliveryAddress: PropTypes.string.isRequired,
    deliveryFirstName: PropTypes.string.isRequired,
    deliveryLastName: PropTypes.string.isRequired,
    deliveryCity: PropTypes.string.isRequired,
    deliveryApt: PropTypes.string.isRequired,
    deliveryCountry: PropTypes.string.isRequired,
    deliveryRegion: PropTypes.string.isRequired,
    deliveryZip: PropTypes.string.isRequired,
    billingAddress: PropTypes.string.isRequired,
    billingFirstName: PropTypes.string.isRequired,
    billingLastName: PropTypes.string.isRequired,
    billingCity: PropTypes.string.isRequired,
    billingApt: PropTypes.string.isRequired,
    billingCountry: PropTypes.string.isRequired,
    billingRegion: PropTypes.string.isRequired,
    billingZip: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    randomPhoneNumberTemplate: PropTypes.string.isRequired
  }).isRequired
};

export default withToastManager(AccountCreator);
