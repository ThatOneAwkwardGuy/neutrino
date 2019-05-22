import React, { Component } from 'react';
import { Container, Row, Col, Input, Label, Table, FormGroup, Button } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
const { BrowserWindow } = require('electron').remote;
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const remote = require('electron').remote;
const path = require('path');

export default class OneClickTester extends Component {
  constructor(props) {
    super(props);
    this.gooogleWindows = {};
    this.state = {
      googleAccountsInput: '',
      googleAccounts: []
    };
  }

  returnAccountRow = (account, index) => {
    return (
      <tr key={`account-${index}`} className="activityRow">
        <td>{index + 1}</td>
        <td>{account.email}</td>
        <td>{account.status}</td>
        <td>
          <FontAwesome
            onClick={() => {
              this.startAccount(index, account);
            }}
            name="play"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            onClick={() => {
              this.stopAccount(index);
            }}
            name="stop"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            name="trash"
            style={{ padding: '10px' }}
            className="taskButton btn"
            onClick={() => {
              this.deleteAccount(index);
            }}
          />
        </td>
      </tr>
    );
  };

  handleChange = e => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  addAccounts = () => {
    const accounts = this.state.googleAccountsInput.split(/\r?\n/).map(account => {
      const splitAccount = account.split(':');
      return { email: splitAccount[0], pass: splitAccount[1], status: 'Not Started' };
    });
    this.setState({
      googleAccounts: accounts,
      googleAccountsInput: ''
    });
  };

  clearAccounts = () => {
    this.setState({
      googleAccounts: []
    });
  };

  setAccountStatus = (index, status) => {
    const googleAccounts = [...this.state.googleAccounts];
    googleAccounts[index].status = status;
    this.setState({ googleAccounts });
  };

  loginToGoogle = async (email, password, cookieJar, index) => {
    const getLoginBody = await rp({
      method: 'GET',
      jar: cookieJar,
      uri:
        'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3D%252F&hl=en',
      followRedirect: true,
      resolveWithFullResponse: true
    });

    const emailLookUp = await rp({
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'google-accounts-xsrf': '1',
        pragma: 'no-cache',
        'x-same-domain': '1',
        referrer:
          'https://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      jar: cookieJar,
      uri: 'https://accounts.google.com/_/signin/sl/lookup?hl=en&_reqid=155835&rt=j',
      followRedirect: true,
      resolveWithFullResponse: true,
      body: `continue=https%3A%2F%2Fwww.google.com%2F&hl=en&f.req=%5B%22${encodeURIComponent(
        email
      )}%22%2C%22AEThLly5pGL2Ki3lmfMGGoS4m_TVeujt1FIJSsmQZomj6YVAOZDM8siVX81Nvq8NPJdvi9H7mzcQBw3JhhT0i-A4xmB1dgbIKZCgeNUVFcgIMQe9fXrKrrAoZgl_qZylmhuaGBmDVS4dw1Z7BrxleZgAzUQpudcSWedKxlF8GaXF5c_AfCNYsxY%22%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C2%2Cfalse%2Ctrue%2C%5Bnull%2Cnull%2C%5B2%2C1%2Cnull%2C1%2C%22https%3A%2F%2Faccounts.google.com%2FServiceLogin%3Fhl%3Den%26passive%3Dtrue%26continue%3Dhttps%253A%252F%252Fwww.google.com%252F%22%2Cnull%2C%5B%5D%2C4%2C%5B%5D%2C%22GlifWebSignIn%22%5D%2C1%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Ctrue%5D%2C%22${encodeURIComponent(
        email
      )}%22%5D&bgRequest=%5B%22identifier%22%2C%22!R0SlRGVCBNogPZe2FY1EgZLrBMxMIAECAAAAa1IAAAfPmQGWUbDP7zUTeTPaAjL7QIFSGE_U96gbmf8e5A1z7nZ_mXPBuWR55S1cWeBXUdzN81-H-ItOfJPAD1WziVmWEU9PTUwNl_UtsEjvZOosNKDKOJMQXdztncQq65E6BTw2ox0PLNLe4dAN5zZwMWd1IA9ovUC2fxf2guMAqzZak3Jf_3mFcCBt3ZcclO4YU8Tx_Cka7Hbs58250Dhgs9z9RkRQwvv-6VBSZYZkLM0a9PsO-pmbZ_mfNu_ShcAzHRGsSuckwvuX1PSzjISDogms6QQ13XYi36WP8yVNOUM6ZfdUfxA1t-S1IdjWxmywPwf7A7X2S6cqxoNHtWnWp63EY0knKaJcgQK4h55itUYbCkv6tMUFnVCL29fA9axFcra3_twxhDDOHtsi8dZGERbYrkdiYQopMFfCXy1xLAA03ld_Zgf3KDbexs7BBhZGHlbM9NWM95NxuoH_HyisCdjZ_s3ZOUZNLKsvryXnMZggKO2o8_y-rZOZHbptCJHJKSgugj6ggsipdIHo-4Ej5lJoC7W2VncuegJb_w%22%5D&azt=AFoagUVFbwXEzlk823d_NYQiekLDhnxJ9Q%3A1553959770855&cookiesDisabled=false&deviceinfo=%5Bnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C%5B%5D%2C%22GlifWebSignIn%22%2Cnull%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%5D&gmscoreversion=undefined&checkConnection=youtube%3A195%3A1&checkedDomains=youtube&pstMsg=1&`
    });
    const loginCode = emailLookUp.body.split(`"`)[3];

    const login = await rp({
      method: 'POST',
      uri: 'https://accounts.google.com/_/signin/sl/challenge?hl=en&_reqid=355835&rt=j',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'google-accounts-xsrf': '1',
        pragma: 'no-cache',
        'x-same-domain': '1',
        referrer:
          'https://accounts.google.com/signin/v2/sl/pwd?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin&cid=1&navigationDirection=forward',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      jar: cookieJar,
      body: `continue=https%3A%2F%2Fwww.google.com%2F&hl=en&f.req=%5B%22${loginCode}%22%2Cnull%2C1%2Cnull%2C%5B1%2Cnull%2Cnull%2Cnull%2C%5B%22${password}%22%2Cnull%2Ctrue%5D%5D%2C%5Bnull%2Cnull%2C%5B2%2C1%2Cnull%2C1%2C%22https%3A%2F%2Faccounts.google.com%2FServiceLogin%3Fhl%3Den%26passive%3Dtrue%26continue%3Dhttps%253A%252F%252Fwww.google.com%252F%22%2Cnull%2C%5B%5D%2C4%2C%5B%5D%2C%22GlifWebSignIn%22%5D%2C1%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Ctrue%5D%5D&bgRequest=%5B%22identifier%22%2C%22!w8ClwOFCBNogPZe2FY1EgZLrBMxMIAECAAAAWVIAAAcmmQGgbUb6bBxVY5Nxr9I6EyGloYcdx5m3oG6jc1mKUTsO9iOyJ6FHpDtOYZgvI4EnJmFukL58L5zksuECDWQ5GgdhYCdHwwObtbe-xZuWfNMqzmR6izzfBLzXawDdE26R8kbyj4ogPU5bZWrMHsrED8KzQAb6TVN-CSlJ-etcVJ4mYALrWR21RAKBWl-4MZBilmfWc6s70epG8yvJuCLES4L-FMOSpAia5IrHn5YwnFzroJ54S7TsCg0uvUysPMREfq1P5vYKeqH5yeOXhe-UjcwQa1Hv3yu3UKaBIVNrwYfLdGVu4qO_pBGLK8DqunZfQ6aBnB2EWaw6VLuv21Mrk1RP_M4lazqlJqRZEuvmT_6Otw4Eo0RNF7hwfDexb-7o5ee5dsBMsiCKXX8K4X28RPF3e-mucrt-KosB3cIZrbGKmkbpPcsaPt1hW5_W40H3hTSCM-R7T5O5H9B0a--HSFVODlWtECqUoh47kb3J3lCBKbio6oC75i2QN-b87GdaCiEKo3lNbBCSwXZYKihgTxokAmSPJov4O5vD8LsTW2FrypI%22%5D&bghash=psDJOMEN-Gt-kYnzHttn5GGc8LdDM2TL5qmr7yJNyfM&azt=AFoagUVFbwXEzlk823d_NYQiekLDhnxJ9Q%3A1553959770855&cookiesDisabled=false&deviceinfo=%5Bnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C%5B%5D%2C%22GlifWebSignIn%22%2Cnull%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%5D&gmscoreversion=undefined&checkConnection=youtube%3A195%3A1&checkedDomains=youtube&pstMsg=1&`,
      followRedirect: true,
      resolveWithFullResponse: true
    });

    if (login.body.includes('INCORRECT_ANSWER_ENTERED')) {
      throw new Error('Wrong Password Entered');
    }
  };

  stopAccount = index => {
    if (this.gooogleWindows[index]) {
      this.gooogleWindows[index].close();
    }
    this.setAccountStatus(index, 'Not Started');
  };

  deleteAccount = index => {
    if (this.gooogleWindows[index]) {
      this.gooogleWindows[index].close();
    }
    delete this.gooogleWindows[index];
    this.setState({
      googleAccounts: this.state.googleAccounts.filter((account, accountIndex) => accountIndex !== index)
    });
  };

  startAccount = (index, account) => {
    this.testAccount(index, account);
  };

  testAccount = async (index, account) => {
    this.setAccountStatus(index, 'Checking Email');
    this.setAccountStatus(index, 'Logging In');
    const tokenID = uuidv4();
    let win = new BrowserWindow({
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
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        webSecurity: false,
        session: remote.session.fromPartition(`account-${tokenID}`)
      }
    });
    this.gooogleWindows[index] = win;
    win.loadURL('https://google.com');
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript(`document.querySelector('a[target="_top"]').click();`);
      win.webContents.once('did-finish-load', () => {
        win.webContents.executeJavaScript(`
          document.getElementById("Email").value = "${account.email}";
          document.getElementById("next").click();
          `);
        win.webContents.once('did-navigate-in-page', () => {
          win.webContents.executeJavaScript(`
            var passwdObserver = new MutationObserver(function(mutations, me) {
              var canvas = document.getElementById("Passwd");
              if (canvas) {
                canvas.value = "${account.pass}";
                document.getElementById("signIn").click();
                me.disconnect();
                return;
              }
            });
            passwdObserver.observe(document, {
                childList: true,
                attributes:true,
                subtree: true,
                characterData: true
            })
            `);
          win.webContents.once('did-finish-load', () => {
            win.webContents.executeJavaScript(`window.location`, false, result => {
              if (result.pathname === '/') {
                win.webContents.session.cookies.get({}, (error, cookies) => {
                  if (error) {
                  } else {
                    // win.loadURL('http://demos.codexworld.com/google-invisible-recaptcha-with-php/');
                    win.loadURL('https://neutrinotools.app/captcha');
                    // win.webContents.executeJavaScript(`document.querySelector('html').style.display = 'none'`);
                    win.webContents.once('dom-ready', () => {
                      win.webContents.executeJavaScript(`grecaptcha.execute()`, false, result => {});
                      win.webContents.once('did-navigate-in-page', () => {
                        win.webContents.executeJavaScript(`window.location.hash`, false, result => {
                          if (result === '#success') {
                            this.setAccountStatus(index, 'One Click Success');
                          } else {
                            this.setAccountStatus(index, 'One Click Fail');
                          }
                          win.close();
                        });
                      });
                    });
                  }
                });
              } else {
                win.close();
                this.setAccountStatus(index, 'Failed To Login');
              }
            });
          });
        });
      });
    });
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
                      <th>status</th>
                    </tr>
                  </thead>
                  <tbody>{this.state.googleAccounts.map(this.returnAccountRow)}</tbody>
                </Table>
              </Col>
            </Row>
            <FormGroup row>
              <Col xs="6">
                <Label>accounts</Label>
                <Input
                  name="googleAccountsInput"
                  type="textarea"
                  placeholder="gmail:pass"
                  rows="4"
                  value={this.state.googleAccountsInput}
                  onChange={this.handleChange}
                />
              </Col>
              <Col className="d-flex flex-column justify-content-end">
                <Button className="nButton" onClick={this.addAccounts}>
                  Add
                </Button>
              </Col>
              <Col className="d-flex flex-column justify-content-end">
                <Button className="nButton">Test</Button>
              </Col>
              <Col className="d-flex flex-column justify-content-end">
                <Button className="nButton" onClick={this.clearAccounts}>
                  Clear
                </Button>
              </Col>
            </FormGroup>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
