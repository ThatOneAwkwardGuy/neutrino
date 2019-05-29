import React, { Component } from 'react';
import { Row, Col, Table, FormGroup, Input, Label, Button } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const rp = require('request-promise');
const cheerio = require('cheerio');
const remote = require('electron').remote;
const { BrowserWindow } = require('electron').remote;

export default class RaffleBot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      raffleDetails: {},
      site: '',
      raffleLink: '',
      sizes: [],
      styles: [],
      entries: []
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loadRaffleInfo = async () => {
    if (this.state.raffleLink !== '') {
      switch (this.state.site) {
        case 'DSML':
          await this.loadDSMLRaffleInfo(this.state.raffleLink);
          break;
        default:
          break;
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
                <option>DSML</option>
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
            <Col xs="2">
              <Label>Size</Label>
              <Input name="size" type="select">
                {this.returnOptions('size', this.state.sizes)}
              </Input>
            </Col>
            <Col xs="2">
              <Button className="nButton w-100" onClick={this.loadRaffleInfo}>
                Load
              </Button>
            </Col>
            <Col xs="2">
              <Button className="nButton w-100">Add Profiles</Button>
            </Col>
          </FormGroup>
        </Col>
      </CSSTransition>
    );
  }
}
