import React, { Component } from 'react';
import { Container, Row, Col, Table, FormGroup, Input, Label, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
import ReactTable from 'react-table';
import { createNewWindow } from '../utils/functions';
const rp = require('request-promise');
const cheerio = require('cheerio');
const remote = require('electron').remote;
const { BrowserWindow } = require('electron').remote;
const { dialog } = require('electron').remote;
const fs = require('fs');
import FootpatrolUK from '../utils/raffle/FootpatrolUK';
export default class RaffleBot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilesModal: false,
      proxyModal: false,
      profilesLoaded: '',
      proxiesInput: '',
      site: '',
      style: '',
      size: '',
      raffleLink: '',
      sizes: [],
      styles: [],
      entries: [],
      proxies: [],
      raffleDetails: {},
      neutrinoRafflesProfileJSON: [],
      styleInput: true,
      sizeInput: true
    };
    this.rp = rp.defaults({
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36'
      }
    });
  }

  handleChange = e => {
    if (e.target.name === 'site') {
      this.setState({
        sizeInput: true,
        styleInput: true
      });
    }
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  toggleProfilesModal = () => {
    this.setState({
      profilesModal: !this.state.profilesModal
    });
  };

  toggleProxyModal = () => {
    this.setState({
      proxyModal: !this.state.proxyModal
    });
  };

  loadProxies = () => {
    this.toggleProxyModal();
    const proxies = this.state.proxiesInput.split(/\n/);
    const formattedProxies = [];
    proxies.forEach(proxy => {
      const splitProxy = proxy.split(/:|@/);
      if (splitProxy.length === 2) {
        formattedProxies.push({
          ip: splitProxy[0],
          port: splitProxy[1]
        });
      } else if (splitProxy.length === 4) {
        formattedProxies.push({
          user: splitProxy[0],
          pass: splitProxy[1],
          ip: splitProxy[2],
          port: splitProxy[3]
        });
      }
    });
    this.setState({
      proxies: formattedProxies
    });
  };

  getRandomProxy = () => {
    const proxies = this.state.proxies;
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    if (randomProxy === undefined) {
      return '';
    } else {
      return randomProxy;
    }
  };

  importFile = () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'Neutrino Raffle Profiles', extensions: ['json'] }]
      },
      fileNames => {
        if (fileNames === undefined) {
          return;
        } else {
          try {
            var contents = fs.readFileSync(fileNames[0]);
            var jsonContent = JSON.parse(contents);
            this.setState({
              neutrinoRafflesProfileJSON: Object.values(jsonContent),
              profilesLoaded: 'Success'
            });
          } catch (error) {
            this.setState({
              profilesLoaded: 'Failed'
            });
          }
        }
      }
    );
  };

  loadEntries = () => {
    this.toggleProfilesModal();
    const newEntries = [];
    this.state.neutrinoRafflesProfileJSON.forEach(profile => {
      let entry = false;
      switch (this.state.site) {
        case 'Footpatrol UK':
          entry = new FootpatrolUK(
            this.state.raffleLink,
            profile,
            this.state.site,
            this.state.style,
            this.state.size,
            'Not Started',
            this.getRandomProxy(),
            this.triggerRender
          );
          break;
        default:
          break;
      }
      console.log(entry);
      if (entry) {
        newEntries.push(entry);
      }
    });
    this.setState({ entries: [...this.state.entries, ...newEntries] });
  };

  loadRaffleInfo = async () => {
    if (this.state.raffleLink !== '') {
      try {
        this.props.setLoading(`Loading ${this.state.site} Raffle Details`, true);
        switch (this.state.site) {
          case 'DSML':
            await this.loadDSMLRaffleInfo(this.state.raffleLink);
            break;
          case 'Footpatrol UK':
            await this.loadFootpatrolUKRaffleInfo(this.state.raffleLink);
            break;
          case 'NakedCPH':
            await this.loadNakedCphRaffleInfo(this.state.raffleLink);
            break;
          default:
            break;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.props.setLoading(``, false);
      }
    }
  };

  loadDSMLRaffleInfo = async link => {
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
        webSecurity: false
      }
    });
    win.loadURL(link);
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript('document.documentElement.innerHTML', false, result => {
        win.close();
        const $ = cheerio.load(result);
        const styles = $('div[fs-field-validation-name="Colour"] option')
          .map((index, style) => {
            return { id: style.attribs.value, name: style.attribs.value };
          })
          .toArray();
        const sizes = $('div[fs-field-validation-name="US Size"] option')
          .map((index, size) => {
            return { id: size.attribs.value, name: size.attribs.value };
          })
          .toArray();
        const fullNameFormID = $('div[fs-field-validation-name="Full Name"] input').attr('name');
        const emailFormID = $('div[fs-field-validation-name="Email"] input').attr('name');
        const phoneFormID = $('div[fs-field-validation-name="Mobile Phone Number"] input').attr('name');
        const postcodeFormID = $('div[fs-field-validation-name="Postcode"] input').attr('name');
        this.setState({
          styles,
          sizes,
          raffleDetails: { fullNameFormID, emailFormID, phoneFormID, postcodeFormID }
        });
      });
    });
  };

  loadNakedCphRaffleInfo = async link => {
    const win = createNewWindow('', '');
    win.loadURL(link);
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript('window.location.href', false, result => {
        if (result === link) {
          win.webContents.executeJavaScript('document.documentElement.innerHTML', false, result => {
            const $ = cheerio.load(result);
            const typeformCode = $('.typeform-widget')
              .attr('data-url')
              .split('/to/')[1];
            this.setState({
              sizeInput: false,
              styleInput: false,
              raffleDetails: { typeformCode }
            });
            win.close();
          });
        }
      });
    });
  };

  loadFootpatrolUKRaffleInfo = async link => {
    const response = await this.rp.get(link);
    const $ = cheerio.load(response);
    const styles = $('select[name="shoeColor"] option:not([disabled])')
      .map((index, style) => {
        return { id: style.attribs.value, name: style.attribs.value };
      })
      .toArray();
    const sizes = $('select[name="shoeSize"] option:not([disabled])')
      .map((index, size) => {
        return { id: size.attribs.value, name: size.attribs.value };
      })
      .toArray();
    this.setState({
      style: styles[0].id,
      size: sizes[0].id,
      styles,
      sizes
    });
  };

  triggerRender = () => {
    this.forceUpdate();
  };

  returnEntryRow = (entry, index) => {
    <tr key={`entry-${index}`}>
      <td>{index + 1}</td>
    </tr>;
  };

  returnOptions = (name, array) => {
    return array.map((elem, index) => (
      <option value={elem.id} key={`${name}-${index}`}>
        {elem.name}
      </option>
    ));
  };

  startAll = () => {
    this.state.entries.forEach(entry => {
      entry.run = true;
      entry.start();
    });
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">
            <ReactTable
              className="proxyTesterTable"
              showPagination={false}
              showPageSizeOptions={false}
              noDataText="no raffles added"
              data={this.state.entries}
              columns={[
                {
                  Header: '#',
                  id: 'row',
                  maxWidth: 50,
                  filterable: false,
                  Cell: row => {
                    return <div>{row.index + 1}</div>;
                  }
                },
                // {
                //   Header: 'email',
                //   accessor: 'profile.email'
                // },
                {
                  Header: 'site',
                  accessor: 'site'
                },
                {
                  Header: 'style',
                  accessor: 'style'
                },
                {
                  Header: 'size',
                  accessor: 'size'
                },
                {
                  Header: 'status',
                  accessor: 'status',
                  minWidth: 100
                },
                {
                  Header: 'actions',
                  id: 'row',
                  maxWidth: 50,
                  filterable: false,
                  Cell: row => {
                    return (
                      <div>
                        <FontAwesome className="px-2" name="play" />
                        <FontAwesome className="px-2" name="stop" />
                        <FontAwesome className="px-2" name="trash" />
                      </div>
                    );
                  }
                }
                // {
                //   Header: 'actions',
                //   accessor: ''
                // }
              ]}
            />
            {/* <Table responsive hover className="text-center col-12">
              <thead>
                <tr>
                  <th>#</th>
                  <th>profile</th>
                  <th>site</th>
                  <th>style</th>
                  <th>size</th>
                  <th>status</th>
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>{this.state.entries.map(this.returnEntryRow)}</tbody>
            </Table> */}
          </Row>
          <FormGroup row>
            <Col xs="2">
              <Label>Site</Label>
              <Input name="site" type="select" onChange={this.handleChange} defaultValue="select site">
                <option disabled>select site</option>
                {/* <option>DSML</option> */}
                <option>Footpatrol UK</option>
                <option>NakedCPH</option>
              </Input>
            </Col>
            <Col xs="2">
              <Label>Raffle Link</Label>
              <Input name="raffleLink" type="text" onChange={this.handleChange} />
            </Col>
            <Col xs="1" className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.loadRaffleInfo}>
                Load
              </Button>
            </Col>
            {this.state.styleInput ? (
              <Col xs="2">
                <Label>Style</Label>
                <Input name="style" type="select" onChange={this.handleChange}>
                  {this.returnOptions('style', this.state.styles)}
                </Input>
              </Col>
            ) : null}
            {this.state.sizeInput ? (
              <Col xs="1">
                <Label>Size</Label>
                <Input name="size" type="select" onChange={this.handleChange}>
                  {this.returnOptions('size', this.state.sizes)}
                </Input>
              </Col>
            ) : null}
            <Col className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.toggleProxyModal}>
                Proxies
              </Button>
            </Col>
            <Col className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.toggleProfilesModal}>
                Profiles
              </Button>
            </Col>
            <Col className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.startAll}>
                Start
              </Button>
            </Col>
          </FormGroup>
          <Modal isOpen={this.state.profilesModal} toggle={this.toggleProfilesModal} size="xl" centered>
            <ModalHeader style={{ borderBottom: 'none' }} toggle={this.toggleProfilesModal}>
              Load Profiles
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col xs="4" className="d-flex">
                  <Button style={{ width: '100%' }} className="align-self-middle nButton">
                    <FontAwesome name="upload" style={{ display: 'block', padding: '10px', width: '100%' }} size="2x" onClick={this.importFile} />
                    Load Profiles
                  </Button>
                </Col>
                <Col>
                  <Label>Input Profiles</Label>
                  <Input
                    type="textarea"
                    rows="6"
                    placeholder="Input properly formatted neutrino raffle profiles or use the profile converter to convert profiles to neutrino raffle profiles"
                  />
                </Col>
              </Row>
              <Row>
                <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
                  <Col xs="4" className="py-3 text-center">
                    {this.state.profilesLoaded === 'Success' ? 'Profiles Loaded' : this.state.profilesLoaded === 'Failed' ? 'Profiles Not Loaded' : ''}
                  </Col>
                </CSSTransition>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button onClick={this.toggleProfilesModal} color="danger">
                Cancel
              </Button>
              <Button onClick={this.loadEntries}>Apply</Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={this.state.proxyModal} toggle={this.toggleProxyModal} size="xl" centered>
            <ModalHeader style={{ borderBottom: 'none' }} toggle={this.toggleProxyModal}>
              Load Proxies
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <Input
                    type="textarea"
                    rows="6"
                    name="proxiesInput"
                    onChange={this.handleChange}
                    placeholder="Input line seperated proxies in the format user:pass@ip:port or user:pass:ip:port or ip:port"
                  />
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button onClick={this.toggleProfilesModal} color="danger">
                Cancel
              </Button>
              <Button onClick={this.loadProxies}>Apply</Button>
            </ModalFooter>
          </Modal>
        </Container>
      </CSSTransition>
    );
  }
}
