import React, { Component } from 'react';
import { Row, Col, Table, FormGroup, Input, Label, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
const rp = require('request-promise');
const cheerio = require('cheerio');
const remote = require('electron').remote;
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
      raffleLink: '',
      sizes: [],
      styles: [],
      entries: [],
      proxies: [],
      raffleDetails: {},
      neutrinoRafflesProfileJSON: {}
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  toggleProfilesModal = () => {
    this.setState({
      profilesModal: !this.state.profilesModal
    });
  };

  toggleProfilesModal = () => {
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
              neutrinoRafflesProfileJSON: jsonContent,
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
    console.log(this.state);
  };

  loadRaffleInfo = async () => {
    if (this.state.raffleLink !== '') {
      try {
        this.props.setLoading(`Loading ${this.state.raffleLink} Raffle Details`);
        switch (this.state.site) {
          case 'DSML':
            await this.loadDSMLRaffleInfo(this.state.raffleLink);
            break;
          case 'Footpatrol UK':
            await this.loadFootpatrolUKRaffleInfo(this.state.raffleLink);
            break;
          default:
            break;
        }
      } catch (error) {
        console.log(error);
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

  loadFootpatrolUKRaffleInfo = async link => {
    const response = await rp.get(link);
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
      styles,
      sizes
    });
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

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">
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
          <FormGroup row>
            <Col xs="2">
              <Label>Site</Label>
              <Input name="site" type="select" onChange={this.handleChange} defaultValue="select site">
                <option disabled>select site</option>
                {/* <option>DSML</option> */}
                <option>Footpatrol UK</option>
              </Input>
            </Col>
            <Col xs="2">
              <Label>Raffle Link</Label>
              <Input name="raffleLink" type="text" onChange={this.handleChange} />
            </Col>
            <Col xs="2">
              <Label>Style</Label>
              <Input name="style" type="select">
                {this.returnOptions('style', this.state.styles)}
              </Input>
            </Col>
            <Col xs="1">
              <Label>Size</Label>
              <Input name="size" type="select">
                {this.returnOptions('size', this.state.sizes)}
              </Input>
            </Col>
            <Col xs="1" className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.loadRaffleInfo}>
                Load
              </Button>
            </Col>
            <Col xs="2" className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.toggleProfilesModal}>
                Add Profiles
              </Button>
            </Col>
            <Col xs="2" className="d-flex">
              <Button className="nButton w-100 align-self-end" onClick={this.toggleProfilesModal}>
                Add Proxies
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
            <ModalHeader style={{ borderBottom: 'none' }} toggle={this.toggleProfilesModal}>
              Load Profiles
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <Input
                    type="textarea"
                    rows="6"
                    name="proxiesInput"
                    onChange={this.handleChange}
                    placeholder="Input line seperated proxies in the format user:pass@ip:port or up:port"
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
        </Col>
      </CSSTransition>
    );
  }
}
