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

  stopAccount = index => {
    if (this.gooogleWindows[index] !== undefined && this.gooogleWindows[index]) {
      this.gooogleWindows[index].close();
    }
    this.setAccountStatus(index, 'Not Started');
  };

  deleteAccount = index => {
    if (this.gooogleWindows[index] !== undefined && this.gooogleWindows[index] && !this.gooogleWindows[index].isDestroyed()) {
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

  testAllAccounts = () => {
    this.state.googleAccounts.forEach((account, index) => {
      this.testAccount(index, account);
    });
  };

  testAccount = async (index, account) => {
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
        webviewTag: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        webSecurity: false,
        session: remote.session.fromPartition(`account-${tokenID}`)
      }
    });
    this.gooogleWindows[index] = win;
    win.webContents.once('close', () => {
      this.setAccountStatus(index, 'Not Started');
    });
    win.loadURL('https://google.com');
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript('document.querySelector(\'a[target="_top"]\').click();');
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
            win.webContents.executeJavaScript('window.location', false, result => {
              if (result.pathname === '/') {
                win.webContents.session.cookies.get({}, (error, cookies) => {
                  if (error) {
                  } else {
                    win.loadURL('https://neutrinotools.app/captcha');
                    win.webContents.once('dom-ready', () => {
                      win.webContents.executeJavaScript('grecaptcha.execute()', false, result => {});
                      win.webContents.once('did-navigate-in-page', () => {
                        win.webContents.executeJavaScript('window.location.hash', false, result => {
                          if (result === '#success') {
                            this.setAccountStatus(index, 'One Click Success');
                          } else {
                            this.setAccountStatus(index, 'One Click Fail');
                          }
                          win.webContents.removeAllListeners('close', (event, input) => {});
                          win.close();
                        });
                      });
                    });
                  }
                });
              } else {
                // win.close();
                this.setAccountStatus(index, 'Stuck In Login');
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
                <Button className="nButton" onClick={this.testAllAccounts}>
                  Test
                </Button>
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
