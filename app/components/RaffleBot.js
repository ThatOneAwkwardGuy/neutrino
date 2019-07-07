import React, { Component } from 'react';
import { Container, Row, Col, Table, FormGroup, Input, Label, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
import ReactTable from 'react-table';
import { createNewWindow } from '../utils/functions';
import FootpatrolUK from '../utils/raffle/FootpatrolUK';
import NakedCPH from '../utils/raffle/NakedCPH';
import ExtraButter from '../utils/raffle/ExtraButter';
import END from '../utils/raffle/END';
import VooStore from '../utils/raffle/VooStore';
import Bodega from '../utils/raffle/Bodega';
import OneBlockDown from '../utils/raffle/OneBlockDown';
const rp = require('request-promise');
const cheerio = require('cheerio');
const { BrowserWindow } = require('electron').remote;
const { dialog } = require('electron').remote;
const fs = require('fs');

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
      profilesModal: !this.state.profilesModal,
      profilesLoaded: false
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
      const sizeObject = this.state.sizes.find(size => String(size.id) === this.state.size);
      const styleObject = this.state.styles.find(style => String(style.id) === this.state.style);
      switch (this.state.site) {
        case 'Footpatrol UK':
          entry = new FootpatrolUK(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'NakedCPH':
          entry = new NakedCPH(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'ExtraButter':
          entry = new ExtraButter(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'END':
          entry = new END(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'VooStore':
          entry = new VooStore(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'Bodega':
          entry = new Bodega(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
            this.triggerRender
          );
          break;
        case 'OneBlockDown':
          entry = new OneBlockDown(
            this.state.raffleLink,
            profile,
            this.state.site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            this.state.raffleDetails,
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
          case 'ExtraButter':
            await this.loadExtraButterRaffleInfo(this.state.raffleLink);
            break;
          case 'END':
            await this.loadEndRaffleInfo(this.state.raffleLink);
            break;
          case 'VooStore':
            await this.loadVooStoreRaffleInfo(this.state.raffleLink);
            break;
          case 'Bodega':
            await this.loadBodegaRaffleInfo(this.state.raffleLink);
            break;
          case 'OneBlockDown':
            await this.loadOneBlockDownRaffleInfo(this.state.raffleLink);
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
      win.webContents.executeJavaScript('window.location.href', false, result => {
        if (result === link) {
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
        }
      });
    });
  };

  loadNakedCphRaffleInfo = async link => {
    const win = createNewWindow('', '');
    win.loadURL(link);
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript('window.location.href', false, result => {
        if (result === link) {
          win.webContents.executeJavaScript('document.documentElement.innerHTML', false, innerHTML => {
            win.webContents.executeJavaScript('window.rendererData', false, renderData => {
              const $ = cheerio.load(innerHTML);
              const typeformCode = $('.typeform-widget')
                .attr('data-url')
                .split('/to/')[1];
              this.setState({
                sizeInput: false,
                styleInput: false,
                raffleDetails: { typeformCode, renderData }
              });
              win.close();
            });
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

  loadExtraButterRaffleInfo = async link => {
    const response = await this.rp.get(`${link.split('?')[0]}.json`);
    const raffleInfo = JSON.parse(response);
    const sizes = raffleInfo.product.variants.map(size => {
      return { id: size.id, name: size.title };
    });
    this.setState({
      styleInput: false,
      size: sizes[0].id.toString(),
      sizes,
      raffleDetails: { product: raffleInfo }
    });
  };

  loadEndRaffleInfo = async link => {
    const splitLink = link.split('/');
    const apilink = `https://launches-api.endclothing.com/api/products/${splitLink[splitLink.length - 1]}`;
    const apiResponse = await this.rp({
      method: 'GET',
      json: true,
      uri: apilink
    });
    const sizes = apiResponse.productSizes.map(size => ({ id: size.id, name: size.sizeDescription }));
    this.setState({
      styleInput: false,
      sizeInput: true,
      sizes,
      size: sizes[0].id,
      raffleDetails: { product: apiResponse }
    });
  };

  loadVooStoreRaffleInfo = async link => {
    const response = await this.rp.get(link);
    const $ = cheerio.load(response);
    const sizes = $('.shoes-sizen-mp>li[id]')
      .map((index, size) => {
        return { id: size.attribs.id.split('_')[1], name: $(size).text() };
      })
      .toArray();
    const token = $('input[name="token"]').val();
    const page_id = $('input[name="page_id"]').val();
    this.setState({
      styleInput: false,
      sizeInput: true,
      sizes,
      size: sizes[0].id,
      raffleDetails: { token, page_id }
    });
  };

  loadBodegaRaffleInfo = async link => {
    const response = await this.rp.get(link);
    let $ = cheerio.load(response);
    const widgetCode = $('script[async=""]')
      .map((index, el) => el.attribs.src)
      .toArray()
      .find(src => src.includes('vsa-widget'))
      .match(/vsa-widget-(.*).js/)[1];
    console.log(widgetCode);
    const widgetBody = await this.rp.get(`https://app.viralsweep.com/vrlswp/widget/${widgetCode}?framed=1`);
    $ = cheerio.load(widgetBody);
    const sizeID = $('select:not([name=""])').attr('name');
    const sizes = $('option:not([value=""])')
      .map((index, el) => ({ id: el.attribs.value, name: el.attribs.value }))
      .toArray();
    console.log(sizeID);
    this.setState({
      styleInput: false,
      sizeInput: true,
      sizes,
      size: sizes[0].id,
      raffleDetails: { widgetCode, sizeID }
    });
  };

  loadOneBlockDownRaffleInfo = async link => {
    return new Promise((resolve, reject) => {
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
        win.webContents.executeJavaScript('preloadedStock', false, preloadedStock => {
          win.webContents.executeJavaScript(`document.querySelector('#raffle-id').value`, false, raffleID => {
            if (preloadedStock) {
              const sizes = preloadedStock.map(size => ({ id: size.id, name: size.variant }));
              this.setState({
                styleInput: false,
                sizeInput: true,
                sizes,
                size: sizes[0].id,
                raffleDetails: { itemId: preloadedStock[0].itemId, stockItemId: preloadedStock[0].stockItemId, raffleID }
              });
              win.close();
              resolve();
            } else {
              reject();
            }
          });
        });
      });
    });
  };

  triggerRender = () => {
    this.forceUpdate();
  };

  startEntry = index => {
    this.state.entries[index].run = true;
    this.state.entries[index].start();
  };

  stopEntry = index => {
    this.state.entries[index].stop();
  };

  deleteEntry = index => {
    this.setState({
      entries: this.state.entries.filter((entry, entryIndex) => index !== entryIndex)
    });
  };

  returnEntryRow = (entry, index) => {
    return (
      <tr key={`entry-${index}`}>
        <td>{index + 1}</td>
        <td>{entry.profile ? entry.profile.email : 'N/A'}</td>
        <td>{entry.site || 'N/A'}</td>
        <td>{entry.style ? entry.style.name : 'N/A'}</td>
        <td>{entry.size ? entry.size.name : 'N/A'}</td>
        <td>{entry.status || 'N/A'}</td>
        <td>
          <FontAwesome
            className="px-2"
            name="play"
            onClick={() => {
              this.startEntry(index);
            }}
          />
          <FontAwesome
            className="px-2"
            name="stop"
            onClick={() => {
              this.stopEntry(index);
            }}
          />
          <FontAwesome
            className="px-2"
            name="trash"
            onClick={() => {
              this.deleteEntry(index);
            }}
          />
        </td>
      </tr>
    );
  };

  returnOptions = (name, array) => {
    const options = array.map((elem, index) => (
      <option value={elem.id} key={`${name}-${index}`}>
        {elem.name}
      </option>
    ));
    options.unshift(
      <option disabled value="" key={`${name}-'disabled'`}>
        Select
      </option>
    );
    return options;
  };

  startAll = () => {
    this.state.entries.forEach(entry => {
      entry.run = true;
      entry.start();
    });
  };

  clearAll = () => {
    this.setState({
      entries: []
    });
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">
            {/* <ReactTable
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
                  accessor: 'style.name'
                },
                {
                  Header: 'size',
                  accessor: 'size.name'
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
            /> */}
            <Table responsive hover className="text-center col-12">
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
            </Table>
          </Row>
          <Row className="my-3">
            <Col xs="2">
              <Label>Site</Label>
              <Input name="site" type="select" onChange={this.handleChange} defaultValue="select site">
                <option disabled>select site</option>
                {/* <option>DSML</option> */}
                <option>Footpatrol UK</option>
                <option>NakedCPH</option>
                <option>ExtraButter</option>
                {/* <option>END</option> */}
                <option>VooStore</option>
                <option>Bodega</option>
                <option>OneBlockDown</option>
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
          </Row>
          <Row className="justify-content-end">
            <Col xs="2" className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.clearAll}>
                Clear
              </Button>
            </Col>
          </Row>
          <Modal isOpen={this.state.profilesModal} toggle={this.toggleProfilesModal} size="xl" centered>
            <ModalHeader style={{ borderBottom: 'none' }} toggle={this.toggleProfilesModal}>
              Load Profiles
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col xs="4" className="d-flex">
                  <Button style={{ width: '100%' }} onClick={this.importFile} className="align-self-middle nButton">
                    <FontAwesome name="upload" style={{ display: 'block', padding: '10px', width: '100%' }} size="2x" />
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
