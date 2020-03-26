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
import { getCookiesFromWindow } from '../RaffleBot/functions';

import Table from '../Table/index';

import { sites } from '../../constants/constants';
import {
  upperCaseFirst,
  createNewWindow,
  generateRandomNLengthString,
  generateUEID
} from '../../utils/utils';
import { getCaptchaResponse } from '../../screens/Captcha/functions';
import { getFormData, randomNumberInRange } from './functions';
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
const HttpsProxyAgent = require('https-proxy-agent');
const tough = require('tough-cookie');
const cloudscraper = require('cloudscraper');

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

  loadEmails = async () => {
    const filePaths = await dialog.showOpenDialog(null, {
      filters: [{ name: 'Emails Text File', extensions: ['txt'] }]
    });
    if (!filePaths.canceled) {
      const filePath = filePaths.filePaths[0];
      const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
      if (filePath.split('.').slice(-1)[0] === 'txt') {
        const emails = file.split('\n');
        this.setState({ emails, quantity: emails.length });
      }
    }
  };

  clearEmails = () => {
    this.setState({
      emails: [],
      quantity: 1
    });
  };

  exportAccountsAsProfiles = async () => {
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
    const fileNames = await dialog.showSaveDialog({
      title: 'name',
      defaultPath: `~/Account-Generator-Neutrino-Profiles.json`
    });
    if (!fileNames.canceled) {
      fs.writeFile(fileNames.filePath, JSON.stringify(profiles), () => {});
    }
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
    <option key={generateUEID()} value={site}>
      {upperCaseFirst(site)}
    </option>
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
          case '': {
            const { toastManager } = this.props;
            toastManager.add(
              'Select a site before attempting to make accounts.',
              {
                appearance: 'error',
                autoDismiss: true,
                pauseOnHover: true
              }
            );
            return;
          }
          case 'nike - US':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createNikeAccount(gmailEmails[index]).catch(e => e)
            );
          case 'gmail - US':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createGmailAccount(gmailEmails[index]).catch(e => e)
            );
          case 'hollywood':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createHollyWoodAccount(gmailEmails[index]).catch(e => e)
            );
          case 'nakedcph':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createNakedCph2Account(gmailEmails[index]).catch(e => e)
            );
          case 'stress95':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createStress95Account(gmailEmails[index]).catch(e => e)
            );
          case 'oneblockdown':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createOneBlockDownAccount(gmailEmails[index]).catch(e => e)
            );
          case 'end':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createEndAccount(gmailEmails[index]).catch(e => e)
            );
          case 'yme':
            return this.sleep(parseInt(delay, 10)).then(() =>
              this.createYMEAccount(gmailEmails[index]).catch(e => e)
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
    console.log(resolvedPromises);
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
    successes.forEach(() => incrementAccounts({ site }));
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
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const tokenID = uuidv4();
    this.cookieJars[tokenID] = request.jar();
    const proxy = useProxies ? this.getRandomProxy() : '';
    const response = await request({
      method: 'POST',
      uri: 'https://eu.oneblockdown.it/account',
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
        agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
        agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const tokenID = uuidv4();
    const proxy = useProxies ? this.getRandomProxy() : '';
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
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
        agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
        agent: useProxies ? new HttpsProxyAgent(proxy) : null,
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
      const accountPass = randomPass ? randomize('*', 10) : pass;
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
          'document.body.innerHTML',
          false
        );
        if (!botOrNotPage.includes('BOT or NOT?!')) {
          await window.webContents.executeJavaScript(
            `
          document.getElementById('firstNameInput').value = '${accountFirstName} ${accountLastName}';
          document.getElementById('emailInput').value = '${email}';
          document.getElementById('passwordInput').value = '${accountPass}';
          document.querySelector('input[name="termsAccepted"]').value = true;
          document.querySelector('input[name="termsAccepted"]').checked = true;
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

  createNakedCph2Account = async gmailEmail => {
    const {
      randomPass,
      randomName,
      useProxies,
      catchall,
      pass,
      firstName,
      site
    } = this.state;
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const jar = request.jar();
    const tokenID = uuidv4();
    const proxy = useProxies ? this.getRandomProxy() : '';
    const rp = cloudscraper.defaults({
      onCaptcha: async (options, response) => {
        const { captcha } = response;
        try {
          const captchaResponse = await getCaptchaResponse({
            cookiesObject: jar._jar.store.idx,
            url: captcha.uri.href.includes('auth/submit')
              ? 'https://www.nakedcph.com/en/auth/view?op=register'
              : captcha.uri.href,
            id: tokenID,
            agent: null,
            baseURL: sites[site],
            site,
            accountPass,
            settings,
            siteKey: captcha.siteKey
          });
          captcha.form['g-recaptcha-response'] = captchaResponse.captchaToken;
          captcha.submit();
        } catch (error) {
          console.log(error);
          captcha.submit(error);
        }
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      jar
    });
    const loginBody = await rp({
      method: 'GET',
      uri: 'https://www.nakedcph.com/en/auth/view?op=register',
      jar,
      headers: {
        authority: 'www.nakedcph.com',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        'sec-fetch-dest': 'document',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'accept-language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(loginBody);
    const antiToken = $('input[name="_AntiCsrfToken"]').attr('value');
    console.log(antiToken);
    const captchaResponse = await getCaptchaResponse({
      cookiesObject: jar._jar.store.idx,
      url: 'https://www.nakedcph.com/en/auth/view?op=register',
      id: tokenID,
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
      baseURL: sites[site],
      site,
      accountPass,
      settings,
      siteKey: '6LetlZQUAAAAAGkLxjR5zvrHZHOSlSFp6t-mrv6J'
    });
    console.log(captchaResponse);
    const registerBody = await rp({
      method: 'POST',
      headers: {
        authority: 'www.nakedcph.com',
        accept: 'application/json, text/javascript, */*; q=0.01',
        'x-anticsrftoken': antiToken,
        'sec-fetch-dest': 'empty',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        origin: 'https://www.nakedcph.com',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        referer: 'https://www.nakedcph.com/en/auth/view?op=register',
        'accept-language': 'en-US,en;q=0.9'
      },
      jar,
      uri: 'https://www.nakedcph.com/en/auth/submit',
      form: {
        _AntiCsrfToken: antiToken,
        firstName: accountFirstName,
        email,
        password: pass,
        termsAccepted: true,
        'g-recaptcha-response': captchaResponse.captchaToken,
        action: 'register'
      }
    });
    console.log(registerBody);
    const parsedRegisterBody = JSON.parse(registerBody);
    if (parsedRegisterBody.Response.Success) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    } else {
      return new Error(
        'There was an error creating your account. this could be due to a banned catchall'
      );
    }
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
      const accountPass = randomPass ? randomize('*', 10) : pass;
      const accountFirstName = randomName ? random.first() : firstName;
      const accountLastName = randomName ? random.last() : lastName;
      const tokenID = uuidv4();
      const proxy = useProxies ? this.getRandomProxy() : '';
      const window = await createNewWindow(tokenID, proxy);
      window.webContents.on('close', () => {
        reject(new Error('Closed Window Before Finished'));
      });
      window.loadURL('https://stress95.com/en/auth/view?op=register');
      window.webContents.on('did-finish-load', async () => {
        await window.webContents.executeJavaScript(
          `
        document.getElementById('firstNameInput').value = '${accountFirstName} ${accountLastName}';
        document.getElementById('emailInput').value = '${email}';
        document.getElementById('passwordInput').value = '${accountPass}';
        document.querySelector('button[type="submit"]').click();
        `,
          false
        );
        window.webContents.on('did-finish-load', async () => {
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
      });
    });
  };

  createEndAccount = async gmailEmail => {
    const {
      randomPass,
      randomName,
      useProxies,
      catchall,
      pass,
      firstName,
      lastName,
      site
    } = this.state;
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const accountLastName = randomName ? random.last() : lastName;
    const dob = `${randomNumberInRange(1, 26)}/${randomNumberInRange(
      1,
      12
    )}/${randomNumberInRange(1980, 1999)}`;
    const proxy = useProxies ? this.getRandomProxy() : '';
    const tokenID = uuidv4();
    this.cookieJars[tokenID] = request.jar();
    let captchaBody = '';
    let loginBody = '';
    try {
      loginBody = await request({
        method: 'GET',
        jar: this.cookieJars[tokenID],
        uri: 'https://www.endclothing.com/gb/customer/account/login/'
      });
    } catch (error) {
      captchaBody = error.response.body;
    }
    if (captchaBody !== '') {
      const captchaID = uuidv4();
      const captchaResponse = await getCaptchaResponse({
        cookiesObject: this.cookieJars[tokenID]._jar.store.idx,
        url: 'https://www.endclothing.com/gb/customer/account/login/',
        id: captchaID,
        agent: useProxies ? new HttpsProxyAgent(proxy) : null,
        baseURL: sites[site],
        site,
        accountPass,
        settings,
        siteKey: '6LdC3UgUAAAAAJIcyA3Ym4j_nCP-ainSgf1NoFku'
      });
      const $ = cheerio.load(captchaBody);
      const remoteip = $('input[name="remoteip"]').attr('value');
      const dCFTicket = $('input[name="dCF_ticket"]').attr('value');
      const action = $('#distilCaptchaForm').attr('action');
      await request({
        method: 'POST',
        uri: `https://www.endclothing.com${action}`,
        jar: this.cookieJars[tokenID],
        form: {
          remoteip,
          dCF_ticket: dCFTicket,
          'g-recaptcha-response': captchaResponse.captchaToken,
          isAjax: 1
        }
      });
      loginBody = await request({
        method: 'GET',
        jar: this.cookieJars[tokenID],
        uri: 'https://www.endclothing.com/gb/customer/account/login/'
      });
    }
    const $ = cheerio.load(loginBody);
    const formKey = $('input[name="form_key"]').attr('value');
    const finalAccountResponse = await request({
      method: 'POST',
      jar: this.cookieJars[tokenID],
      resolveWithFullResponse: true,
      formData: {
        form_key: formKey,
        success_url: '',
        error_url: '',
        firstname: accountFirstName,
        lastname: accountLastName,
        email,
        dob,
        password: accountPass,
        password_confirmation: accountPass
      },
      uri: 'https://www.endclothing.com/gb/customer/account/createpost/',
      maxRedirects: 1,
      followAllRedirects: true,
      followRedirect: true
    });
    if (
      finalAccountResponse.body.includes(
        `${accountFirstName} ${accountLastName}`
      ) &&
      finalAccountResponse.body.includes(email)
    ) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    } else {
      return new Error(
        'There was an error creating your account. this could be due to a banned catchall'
      );
    }
  };

  createYMEAccount = async gmailEmail => {
    const {
      randomPass,
      randomName,
      useProxies,
      catchall,
      pass,
      firstName,
      site
    } = this.state;
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const jar = request.jar();
    const tokenID = uuidv4();
    const proxy = useProxies ? this.getRandomProxy() : '';
    const rp = cloudscraper.defaults({
      onCaptcha: async (options, response) => {
        const { captcha } = response;
        try {
          const captchaResponse = await getCaptchaResponse({
            cookiesObject: jar._jar.store.idx,
            url: captcha.uri.href.includes('auth/submit')
              ? 'https://www.ymeuniverse.com/en/auth/view?op=register'
              : captcha.uri.href,
            id: tokenID,
            agent: null,
            baseURL: sites[site],
            site,
            accountPass,
            settings,
            siteKey: captcha.siteKey
          });
          captcha.form['g-recaptcha-response'] = captchaResponse.captchaToken;
          captcha.submit();
        } catch (error) {
          console.log(error);
          captcha.submit(error);
        }
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
      },
      jar
    });
    const loginBody = await rp({
      method: 'GET',
      uri: 'https://www.ymeuniverse.com/en/auth/view?op=register',
      jar,
      headers: {
        authority: 'www.ymeuniverse.com',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        'sec-fetch-dest': 'document',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'accept-language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(loginBody);
    const antiToken = $('input[name="_AntiCsrfToken"]').attr('value');
    const captchaResponse = await getCaptchaResponse({
      cookiesObject: jar._jar.store.idx,
      url: 'https://www.ymeuniverse.com/en/auth/view?op=register',
      id: tokenID,
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
      baseURL: sites[site],
      site,
      accountPass,
      settings,
      siteKey: '6LetlZQUAAAAAGkLxjR5zvrHZHOSlSFp6t-mrv6J'
    });
    const registerBody = await rp({
      method: 'POST',
      headers: {
        authority: 'www.ymeuniverse.com',
        'cache-control': 'max-age=0',
        origin: 'https://www.ymeuniverse.com',
        'upgrade-insecure-requests': '1',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        'sec-fetch-dest': 'document',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        referer: 'https://www.ymeuniverse.com/en/auth/view?op=register',
        'accept-language': 'en-US,en;q=0.9'
      },
      jar,
      uri: 'https://www.ymeuniverse.com/en/auth/submit',
      form: {
        _AntiCsrfToken: antiToken,
        firstName: accountFirstName,
        email,
        password: accountPass,
        'g-recaptcha-response': captchaResponse.captchaToken
      }
    });
    const parsedRegisterBody = JSON.parse(registerBody);
    if (parsedRegisterBody.Response.Success) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    } else {
      return new Error(
        'There was an error creating your account. this could be due to a banned catchall'
      );
    }
  };

  getCookiesAfterCloudflarePage = async link => {
    const tokenID = uuidv4();
    const win = await createNewWindow(tokenID);
    return new Promise((resolve, reject) => {
      try {
        win.loadURL(link);
        win.webContents.on('dom-ready', async () => {
          const html = await win.webContents.executeJavaScript(
            'document.body.innerHTML',
            false
          );
          if (
            !html.includes('BOT or NOT?!') &&
            !html.includes('Man or machine?')
          ) {
            const cookies = await win.webContents.session.cookies.get({});
            win.close();
            resolve(cookies);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  createHollyWoodAccount = async gmailEmail => {
    const {
      randomPass,
      randomName,
      useProxies,
      site,
      catchall,
      pass,
      firstName
    } = this.state;
    const { addCreatedAccount, settings } = this.props;
    const email =
      gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
    const accountPass = randomPass ? randomize('*', 10) : pass;
    const accountFirstName = randomName ? random.first() : firstName;
    const tokenID = uuidv4();
    this.cookieJars[tokenID] = request.jar();
    const proxy = useProxies ? this.getRandomProxy() : '';
    const cookies = await getCookiesFromWindow(
      'https://www.hollywood.se/auth/submit',
      proxy
    );
    cookies.forEach(cookie => {
      const toughCookie = new tough.Cookie({
        key: cookie.name,
        value: cookie.value,
        httpOnly: cookie.httpOnly,
        hostOnly: cookie.hostOnly,
        path: cookie.path
      });
      this.cookieJars[tokenID].setCookie(
        toughCookie.toString(),
        'https://www.hollywood.se/auth/submit'
      );
    });
    const captchaResponse = await getCaptchaResponse({
      cookiesObject: this.cookieJars[tokenID]._jar.store.idx,
      url: 'https://www.hollywood.se/auth/view',
      id: tokenID,
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
      baseURL: sites[site],
      site,
      accountPass,
      settings,
      siteKey: '6LcAB4wUAAAAABgTVnim-xSegGfH9ewhf7n_hfG3'
    });
    const payload = {
      email,
      password: accountPass,
      firstName: accountFirstName,
      'g-recaptcha-response': captchaResponse.captchaToken,
      action: 'register'
    };
    const anticsrftokenCookie = cookies.find(
      cookie => cookie.name === 'AntiCsrfToken'
    );
    const response = await request({
      method: 'POST',
      url: 'https://www.hollywood.se/auth/submit',
      followRedirect: true,
      agent: useProxies ? new HttpsProxyAgent(proxy) : null,
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: this.cookieJars[tokenID],
      headers: {
        authority: 'www.hollywood.se',
        accept: 'application/json, text/javascript, */*; q=0.01',
        'x-anticsrftoken': anticsrftokenCookie.value,
        'x-requested-with': 'XMLHttpRequest',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        origin: 'https://www.hollywood.se',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        referer: 'https://www.hollywood.se/auth/view'
      },
      // body: queryString
      form: payload
    });
    const jsonResponse = JSON.parse(response.body);
    if (jsonResponse.Response.Success) {
      addCreatedAccount({
        email,
        site,
        pass: accountPass,
        status: 'created'
      });
    } else {
      return new Error(
        'There was an error creating your account. this could be due to a banned catchall'
      );
    }
  };

  // createNikeAccount = async gmailEmail => {
  //   const {
  //     randomPass,
  //     randomName,
  //     useProxies,
  //     site,
  //     catchall,
  //     pass,
  //     firstName,
  //     lastName
  //   } = this.state;
  //   const { addCreatedAccount } = this.props;
  //   return new Promise(async (resolve, reject) => {
  //     const email =
  //       gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
  //     const accountPass = randomPass ? randomize('*', 10) : pass;
  //     const accountFirstName = randomName ? random.first() : firstName;
  //     const accountLastName = randomName ? random.last() : lastName;
  //     const tokenID = uuidv4();
  //     const proxy = useProxies ? this.getRandomProxy() : '';
  //     const window = await createNewWindow(tokenID, proxy);
  //     window.webContents.on('close', () => {
  //       reject(new Error('Closed Window Before Finished'));
  //     });
  //     window.webContents.executeJavaScript(`
  //     document.querySelector('input[autocomplete="email"]').value = "${email}";
  //     document.querySelector('input[autocomplete="email"]').value = "${randomNumberInRange(
  //       1970,
  //       2000
  //     )}-${randomNumberInRange(1, 12)}-${randomNumberInRange(1, 27)}";

  //     `);
  //     window.loadURL('https://www.nike.com/email-signup');
  //   });
  // };

  // createGmailAccount = async gmailEmail => {
  //   const {
  //     randomPass,
  //     randomName,
  //     useProxies,
  //     site,
  //     catchall,
  //     pass,
  //     firstName,
  //     lastName
  //   } = this.state;
  //   const { addCreatedAccount, settings } = this.props;
  //   return new Promise(async (resolve, reject) => {
  //     const email =
  //       gmailEmail || `${generateRandomNLengthString(10)}@${catchall}`;
  //     const accountPass = randomPass ? randomize('*', 10) : pass;
  //     const accountFirstName = randomName ? random.first() : firstName;
  //     const accountLastName = randomName ? random.last() : lastName;
  //     const tokenID = uuidv4();
  //     const proxy = useProxies ? this.getRandomProxy() : '';
  //     const window = await createNewWindow(tokenID, proxy);
  //     window.webContents.on('close', () => {
  //       reject(new Error('Closed Window Before Finished'));
  //     });
  //     window.loadURL(
  //       'https://accounts.google.com/signup/v2/webcreateaccount?continue=https%3A%2F%2Fwww.google.com%2F&hl=en&dsh=S-335479417%3A1578947587932690&flowName=GlifWebSignIn&flowEntry=SignUp'
  //     );
  //     window.webContents.executeJavaScript(`
  //     document.querySelector('input[name="firstName"]').value = "${accountFirstName}";
  //     document.querySelector('input[name="lastName"]').value = "${accountLastName}";
  //     document.querySelector('input[name="Username"]').value = "${generateRandomNLengthString(
  //       10
  //     )}";
  //     document.querySelector('input[name="Passwd"]').value = "${accountPass}";
  //     document.querySelector('input[name="ConfirmPasswd"]').value = "${accountPass}";
  //     document.getElementById('accountDetailsNext').click();
  //     `);
  //     window.webContents.executeJavaScript(`
  //       var passwdObserver = new MutationObserver(function(mutations, me) {
  //         var canvas = document.getElementById("countryList");
  //         if (canvas) {
  //           setTimeout(function(){ document.querySelector('#countryList > div:nth-child(1)').click(); }, 3000);
  //           setTimeout(function(){ document.querySelector("#countryList > div > div[data-value='us'").click(); }, 5000);
  //           me.disconnect();
  //           return;
  //         }
  //       });
  //       passwdObserver.observe(document, {
  //           childList: true,
  //           attributes:true,
  //           subtree: true,
  //           characterData: true
  //       })
  //     `);
  //     // window.webContents.once('did-navigate-in-page', async () => {
  //     //   console.log('Testin');
  //     //   window.webContents.executeJavaScript(`
  //     //   setTimeout(function(){ document.querySelector('#countryList > div:nth-child(1)').click(); }, 3000);
  //     //   setTimeout(function(){ document.querySelector("#countryList > div > div[data-value='us'").click(); }, 5000);
  //     // `);
  //     const mobileNumber = await getNikeUSMobileNumberGetSMSCode(settings);
  //   });
  // };

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
                  size="2x"
                  icon="cog"
                  className="hoverIcon"
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
                    {Object.keys(sites)
                      .sort()
                      .map(this.returnSiteOption)}
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
                    Gmail/Catchall*{' '}
                    <Tooltip
                      arrow
                      distance={20}
                      title="The catchall you will be using to create accounts. You can also enter a gmail account here and use that as your catchall. If you do no know what a catchall is, read the guide."
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
