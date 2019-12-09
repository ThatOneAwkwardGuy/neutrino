import React, { Component } from 'react';
import { Container, Row, Col, Input, Label, Button } from 'reactstrap';
import { withToastManager } from 'react-toast-notifications';
import { Tooltip } from 'react-tippy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { convertCSVToBase } from '../ProfileTaskEditorConverter/functions';
import { convertBaseToNeutrino } from '../ProfileCreator/functions';
import Table from '../Table';
import { setProxyForSession } from '../../utils/utils';

const { remote } = require('electron');
const { BrowserWindow } = require('electron').remote;
const { dialog } = require('electron').remote;

const fs = require('fs');
const csv = require('csvtojson');

const appPath = remote.app.getAppPath();

class Browser extends Component {
  constructor(props) {
    super(props);
    this.windows = {};
    this.state = {
      profiles: [],
      order: 'asc',
      orderBy: '#',
      proxyInput: '',
      site: 'http://google.com'
    };
  }

  handleSort = (event, property) => {
    const { orderBy, order } = this.state;
    const isDesc = orderBy === property && order === 'desc';
    this.setState({
      order: isDesc ? 'asc' : 'desc',
      orderBy: property
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  startAllBrowsers = () => {
    const { profiles } = this.state;
    profiles.forEach(profile => {
      this.startBrowser(profile);
    });
  };

  stopAllBrowsers = () => {
    Object.values(this.windows).forEach(window => {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    });
    this.windows = {};
  };

  deleteAllBrowsers = () => {
    Object.values(this.windows).forEach(window => {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    });
    this.windows = {};
    this.setState({
      profiles: []
    });
  };

  importProfiles = () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'Neutrino Profiles', extensions: ['json', 'csv'] }]
      },
      async fileNames => {
        if (fileNames !== undefined) {
          try {
            const extension = fileNames[0]
              .split('.')
              .slice(-1)[0]
              .toLowerCase();
            let jsonContent;
            if (extension === 'csv') {
              const convertedCSV = await csv().fromFile(fileNames[0]);
              jsonContent = convertedCSV.map((profile, index) => {
                const baseProfile = convertCSVToBase(profile);
                return convertBaseToNeutrino(
                  index,
                  baseProfile,
                  baseProfile.card,
                  '',
                  ''
                );
              });
            } else {
              const contents = fs.readFileSync(fileNames[0]);
              jsonContent = JSON.parse(contents);
            }

            this.setState({
              profiles: Object.values(jsonContent)
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  };

  deleteBrowser = row => {
    const { profiles } = this.state;
    const profile = row.row.original;
    const newProfiles = profiles.filter((p, index) => index !== row.row.index);
    if (
      this.windows[profile.email] &&
      !this.windows[profile.email].isDestroyed()
    ) {
      this.windows[profile.email].destroy();
      delete this.windows[profile.email];
    }
    this.setState({ profiles: newProfiles });
  };

  getRandomProxy = () => {
    const { proxyInput } = this.state;
    const proxies = proxyInput.split('\n');
    console.log(proxyInput);
    console.log(proxies);
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    const splitRandomProxy =
      randomProxy !== undefined ? randomProxy.split(':') : undefined;
    if (splitRandomProxy.length === 2) {
      return `http://${splitRandomProxy[0]}:${splitRandomProxy[1]}`;
    }
    if (splitRandomProxy.length === 4) {
      return `http://${splitRandomProxy[2]}:${splitRandomProxy[3]}@${
        splitRandomProxy[0]
      }:${splitRandomProxy[1]}`;
    }
    return '';
  };

  startBrowser = async profile => {
    const { site } = this.state;
    const proxy = this.getRandomProxy();
    const browserURL =
      process.env.NODE_ENV === 'development'
        ? `file://${appPath}/browser.html`
        : `file://${appPath}/app/browser.html`;
    this.windows[profile.email] = new BrowserWindow({
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
        javascript: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        webSecurity: false
      }
    });
    console.log(proxy);
    if (proxy !== '') {
      await setProxyForSession(
        proxy,
        this.windows[profile.email],
        remote.session.fromPartition(`persist:browser-${profile.email}`)
      );
    }
    this.windows[profile.email].loadURL(`${browserURL}#${profile.email}`);
    const { webContents } = this.windows[profile.email];
    webContents.once('dom-ready', async () => {
      await webContents.executeJavaScript(
        `const webview = document.querySelector('webview');
        webview.addEventListener('dom-ready', () => {
          webview.executeJavaScript(\`
          window.autofillInterval = setInterval(() => {
            document.querySelector('input[autocomplete="email"]') !== null ? document.querySelector('input[autocomplete="email"]').value = '${
              profile.email
            }' : null;
            document.querySelector('input[name="email"]') !== null ? document.querySelector('input[name="email"]').value = '${
              profile.email
            }' : null;
            document.querySelector('input[name="user[email]"]') !== null ? document.querySelector('input[name="user[email]"]').value = '${
              profile.email
            }' : null;
            document.querySelector('input[autocomplete="name"]') !== null ? document.querySelector('input[autocomplete="name"]').value = '${
              profile.deliveryFirstName
            } ${profile.deliveryLastName}' : null;
            document.querySelector('input[name="name"]') !== null ? document.querySelector('input[name="name"]').value = '${
              profile.deliveryFirstName
            } ${profile.deliveryLastName}' : null;
            document.querySelector('input[autocomplete="fname"]') !== null ? document.querySelector('input[autocomplete="fname"]').value = '${
              profile.deliveryFirstName
            }' : null;
            document.querySelector('input[name="fname"]') !== null ? document.querySelector('input[name="fname"]').value = '${
              profile.deliveryFirstName
            }' : null;
            document.querySelector('input[autocomplete="lname"]') !== null ? document.querySelector('input[autocomplete="lname"]').value = '${
              profile.deliveryLastName
            }' : null;
            document.querySelector('input[name="lname"]') !== null ? document.querySelector('input[name="lname"]').value = '${
              profile.deliveryLastName
            }' : null;
            document.querySelector('input[name="address"]') !== null ? document.querySelector('input[name="address"]').value = '${
              profile.deliveryAddress
            }' : null;
            document.querySelector('input[name="postal_code"]') !== null ? document.querySelector('input[name="postal_code"]').value = '${
              profile.deliveryZip
            }' : null;
            document.querySelector('input[autocomplete="cc-number"]') !== null ? document.querySelector('input[autocomplete="cc-number"]').value = '${
              profile.card.cardNumber !== ''
                ? profile.card.cardNumber.match(/.{1,4}/g).join(' ')
                : ''
            }' : null;
            document.querySelector('input[autocomplete="cc-exp"]') !== null ? document.querySelector('input[autocomplete="cc-exp"]').value = '${
              profile.card.expMonth
            } / ${
          profile.card.expYear !== '' ? profile.card.expYear.slice(-2) : ''
        }' : null;
        document.querySelector('input[autocomplete="cc-csc"]') !== null ? document.querySelector('input[autocomplete="cc-csc"]').value = '${
          profile.card.cvv
        }' : null;
        document.querySelector('input[autocomplete="ccname"]') !== null ? document.querySelector('input[autocomplete="ccname"]').value = '${
          profile.card.paymentCardholdersName
        }' : null;
        document.querySelector('input[autocomplete="billing address-line1"]') !== null ? document.querySelector('input[autocomplete="billing address-line1"]').value = '${
          profile.billingAddress
        }' : null;
        document.querySelector('input[autocomplete="billing address-level2"]') !== null ? document.querySelector('input[autocomplete="billing address-level2"]').value = '${
          profile.bilingCity
        }' : null;
        document.querySelector('input[autocomplete="billing postal-code"]') !== null ? document.querySelector('input[autocomplete="billing postal-code"]').value = '${
          profile.billingZip
        }' : null;
        document.querySelector('input[name="password"]') !== null ? document.querySelector('input[name="password"]').value = '${
          profile.password
        }' : null;
          }, 500)
          \`);
        });
        `
      );
      await webContents.executeJavaScript(`webview.loadURL('${site}');`);
    });
  };

  render() {
    const { deleteBrowser, startBrowser } = this;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Actions',
        Cell: row => (
          <div>
            <FontAwesomeIcon
              className="mx-3"
              icon="play"
              onClick={() => {
                startBrowser(row.row.original);
              }}
            />
            <FontAwesomeIcon className="mx-3" icon="stop" onClick={() => {}} />
            <FontAwesomeIcon
              className="mx-3"
              icon="trash"
              onClick={() => {
                deleteBrowser(row);
              }}
            />
          </div>
        )
      }
    ];

    const { profiles, site, proxyInput } = this.state;
    return (
      <Row className="h-100">
        <Col className="h-100">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: profiles,
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
            <Row>
              <Col>
                <Container fluid>
                  <Row>
                    <Col xs="6" className="py-3">
                      <Label>
                        Proxies*{' '}
                        <Tooltip
                          arrow
                          distance={20}
                          title="The proxies you want to test."
                        >
                          <FontAwesomeIcon icon="question-circle" />
                        </Tooltip>
                      </Label>
                      <Input
                        rows="4"
                        type="textarea"
                        placeholder="ip:port or ip:port:user:pass"
                        value={proxyInput}
                        name="proxyInput"
                        onChange={this.handleChange}
                      />
                    </Col>
                    <Col xs="3" className="py-3">
                      <Label>
                        Website*{' '}
                        <Tooltip
                          arrow
                          distance={20}
                          title="The starting website you want to load before "
                        >
                          <FontAwesomeIcon icon="question-circle" />
                        </Tooltip>
                      </Label>
                      <Input
                        type="text"
                        value={site}
                        name="site"
                        onChange={this.handleChange}
                      />
                      <Button className="my-2" onClick={this.importProfiles}>
                        Load Profiles
                      </Button>
                    </Col>
                    <Col xs="3" className="py-3">
                      <Button className="my-2" onClick={this.startAllBrowsers}>
                        Start All
                      </Button>
                      <Button onClick={this.stopAllBrowsers}>Stop All</Button>
                      <Button
                        className="my-2"
                        color="danger"
                        onClick={this.deleteAllBrowsers}
                      >
                        Delete All
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

Browser.propTypes = {
  setLoading: PropTypes.func.isRequired,
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired
};

export default withToastManager(Browser);
