import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup, Form } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Countries from '../store/countries';
import Toggle from 'react-toggle';
const { clipboard } = require('electron');
const TRANSLATIONS = [
  ['alley', 'allee', 'aly', 'alley', 'ally', 'aly'],
  ['anex', 'anex', 'anx', 'annex', 'annx', 'anx'],
  ['arcade', 'arc', 'arc', 'arcade'],
  ['avenue', 'av', 'ave', 'ave', 'aven', 'avenu', 'avenue', 'avn', 'avnue'],
  ['bayou', 'bayoo', 'byu', 'bayou'],
  ['beach', 'bch', 'bch', 'beach'],
  ['bend', 'bnd'],
  ['bluff', 'blf', 'bluf', 'bluffs', 'blfs'],
  ['bottom', 'bot', 'btm', 'bottm'],
  ['boulevard', 'blvd', 'boul', 'boulv'],
  ['street', 'st.', 'st', 'streett', 'steet', 'sreet'],
  ['drive', 'dr.', 'dr', 'drivee', 'driv', 'drv'],
  ['lane', 'ln.', 'ln'],
  ['avenue', 'ave.', 'ave', 'av', 'avene', 'avenu'],
  ['west', 'w.', 'w'],
  ['east', 'e.', 'e'],
  ['north', 'n.', 'n'],
  ['south', 's.', 's'],
  ['east', 'e.', 'e'],
  ['boulevard', 'blvd', 'blvd.'],
  ['mountain', 'mtn.', 'mtn'],
  ['road', 'rd', 'raod', 'roaad', 'rooad'],
  ['place', 'pl', 'plce', 'plac', 'plae', 'pplace', 'plaace'],
  ['circle', 'cirkle', 'circl', 'cirkle'],
  ['via', 'vvia', 'viia', 'viaa', 'vviiaa', 'viiaa', 'vviaa', 'vviia'],
  ['viale', 'vviale', 'viiale', 'viaale', 'vialle', 'vialee'],
  ['vviuzza', 'viiuzza', 'viuuzza', 'viuzzza', 'viuzzza', 'viuzzaa'],
  ['ccorso', 'coorso', 'corrso', 'corsso', 'corsoo'][('sstrada', 'sttrada', 'strrada', 'straada', 'stradda', 'stradaa')],
  ['ppassaggio', 'paassaggio', 'passsaggio', 'passsaggio', 'passaaggio', 'passagggio', 'passagggio', 'passaggiio', 'passaggioo'],
  ['RRoute', 'Rooute', 'Rouute', 'Routte', 'Routee'],
  ['AAvenue', 'Avvenue', 'Aveenue', 'Avennue', 'Avenuue', 'Avenuee'],
  ['CChemin', 'Chhemin', 'Cheemin', 'Chemmin', 'Chemiin', 'Cheminn'],
  ['BBoulevard', 'Booulevard', 'Bouulevard', 'Boullevard', 'Bouleevard', 'Boulevvard', 'Boulevaard', 'Boulevarrd', 'Boulevardd'],
  ['GGaffe', 'Gaaffe', 'Gafffe', 'Gafffe', 'Gaffee'],
  ['IImpasse', 'Immpasse', 'Imppasse', 'Impaasse', 'Impassse', 'Impassse', 'Impassee'],
  ['PPassage', 'Paassage', 'Passsage', 'Passsage', 'Passaage', 'Passagge', 'Passagee'],
  ['RRou', 'Roou', 'Rouu'],
  ['RRuelle', 'Ruuelle', 'Rueelle', 'Ruellle', 'Ruellle', 'Ruellee'],
  ['SStrasse', 'Sttrasse', 'Strrasse', 'Straasse', 'Strassse', 'Strassse', 'Strassee'],
  ['PPlatz', 'Pllatz', 'Plaatz', 'Plattz', 'Platzz']
];

export default class AddressJigger extends Component {
  constructor(props) {
    super(props);
    this.countryNames = Object.keys(Countries);
    this.state = {
      deliveryCountry: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryProvince: '',
      deliveryZip: '',
      deliveryAptorSuite: '',
      numberOfAddresses: '1',
      jiggedAddress: [],
      regionArrayShipping: [],
      jigAddresses: true,
      fourCharPrefix: false
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  returnCountry = (name, index) => <option key={`country-${index}`}>{name}</option>;

  setRegionArrayShipping = countryName => {
    this.setState({
      regionArrayShipping: Countries[countryName].provinces
    });
    if (Countries[countryName].provinces !== null) {
      this.setState(prevState => ({
        formdata: {
          ...prevState.formdata,
          deliveryProvince: Countries[countryName].provinces[0]
        }
      }));
    } else {
      this.setState(prevState => ({
        formdata: {
          ...prevState.formdata,
          deliveryProvince: ''
        }
      }));
    }
  };

  jigAddress = addressString => {
    let jigs = new Set([addressString]);
    let lines = addressString.split('\n');
    let parts = lines[0].split(' ');
    for (var index = 0; index < parts.length; index++) {
      let part = parts[index];
      TRANSLATIONS.forEach(entry => {
        let possibleJigs = [];
        entry.forEach(val => {
          if (part.toLowerCase() === val) {
            entry.forEach(value => {
              if (value !== val && (!value.endsWith('.') || part.endsWith('.'))) {
                possibleJigs.push(value);
              }
            });
          }
        });
        possibleJigs.forEach(jig => {
          jigs.forEach(address => {
            let fullJig = '';
            let valueLines = address.split('\n');
            let valueParts = valueLines[0].split(' ');
            for (var i = 0; i < valueParts.length; i++) {
              fullJig += (i !== index ? valueParts[i] : jig) + ' ';
            }
            fullJig = fullJig.substring(0, fullJig.length - 1);
            for (var i = 1; i < valueLines.length; i++) {
              fullJig += '\n' + valueLines[i];
            }
            jigs.add(fullJig);
          });
        });
      });
    }
    if (parts.length >= 3) {
      jigs.forEach(address => {
        if (lines.length == 1 && !address.includes('\n')) {
          let addressParts = address.split(' ');
          for (var i = 2; i < addressParts.length; i++) {
            if (addressParts.length == 3) {
              if (addressParts[2].length < 3) {
                continue;
              }
            }
            let splitAddress = '';
            for (var j = 0; j < i; j++) {
              splitAddress += addressParts[j] + ' ';
            }
            splitAddress = splitAddress.substring(0, splitAddress.length - 1) + '\n';
            for (var j = i; j < addressParts.length; j++) {
              splitAddress += addressParts[j] + ' ';
            }
            jigs.add(splitAddress.substring(0, splitAddress.length - 1));
          }
        }
      });
    }
    return jigs;
  };

  toggleButton = e => {
    this.setState({
      [e.target.name]: !this.state[e.target.name]
    });
  };

  copyToClipboard = () => {
    let string = '';
    this.state.jiggedAddress.forEach(elem => {
      string += `${elem}\n`;
    });
    clipboard.writeText(string, 'selection');
  };

  makeid = length => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text.toUpperCase();
  };

  generateAddresses = () => {
    const addressString = `${this.state.deliveryAddress} ${this.state.deliveryAptorSuite}
    ${this.state.deliveryCity}, ${this.state.deliveryProvince}
    ${this.state.deliveryZip}
    ${this.state.deliveryCountry}`;
    const jigsSet = this.state.jigAddresses ? this.jigAddress(addressString) : Array(parseInt(this.state.numberOfAddresses)).fill(addressString);
    const jigs = Array.from(jigsSet).map(text => {
      const modifiedText = text
        .toLowerCase()
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
      return `${this.state.fourCharPrefix ? this.makeid(4).toUpperCase() + ' ' : ''}${modifiedText}`;
    });

    console.log(jigs);
    if (jigs.length < parseInt(this.state.numberOfAddresses)) {
      this.setState({ jiggedAddress: jigs });
    } else {
      this.setState({ jiggedAddress: jigs.slice(0, parseInt(this.state.numberOfAddresses)) });
    }
  };

  returnJiggedAddresses = addressArray => {
    return addressArray.map((elem, index) => (
      <Col key={index} xs="3" style={{ padding: '20px', border: 'solid 5px #222222', background: '#2745fb' }}>
        {elem}
      </Col>
    ));
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1" style={{ overflowX: 'scroll', padding: '20px', maxHeight: '75%' }}>
            {this.returnJiggedAddresses(this.state.jiggedAddress)}
          </Row>
          <FormGroup row>
            <Col xs="4">
              <Label for="store">address</Label>
              <Input
                type="text"
                name="deliveryAddress"
                id="deliveryAddress"
                value={this.state.deliveryAddress}
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="1">
              <Label for="store">apt,suite</Label>
              <Input
                type="text"
                name="deliveryAptorSuite"
                id="deliveryAptorSuite"
                value={this.state.deliveryAptorSuite}
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="2">
              <Label for="store">city</Label>
              <Input
                type="text"
                name="deliveryCity"
                id="deliveryCity"
                value={this.state.deliveryCity}
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="2">
              <Label for="store">country</Label>
              <Input
                type="select"
                name="deliveryCountry"
                id="deliveryCountry"
                value={this.state.deliveryCountry}
                onChange={event => {
                  this.handleChange(event);
                  this.setRegionArrayShipping(event.target.value);
                }}
              >
                <option value="" />
                {this.countryNames.map(this.returnCountry)}
              </Input>
            </Col>
            <Col xs="3">
              <Label for="store">region</Label>
              <Input
                type="select"
                name="deliveryProvince"
                id="deliveryProvince"
                value={this.state.deliveryProvince}
                onChange={event => {
                  this.handleChange(event);
                }}
              >
                {this.state.regionArrayShipping !== null ? this.state.regionArrayShipping.map(this.returnCountry) : null}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col xs="2">
              <Label for="store">zip code</Label>
              <Input
                type="text"
                name="deliveryZip"
                id="deliveryZip"
                value={this.state.deliveryZip}
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="2">
              <Label for="numberOfAddresses">quantity</Label>
              <Input
                name="numberOfAddresses"
                value={this.state.numberOfAddresses}
                onChange={e => {
                  this.handleChange(e);
                }}
                type="number"
              />
            </Col>
            <Col xs="2">
              <Label style={{ marginBottom: '1rem' }}>Jig Addresses</Label>
              <div>
                <Toggle name="jigAddresses" checked={this.state.jigAddresses} onChange={this.toggleButton} />
              </div>
            </Col>
            <Col xs="3">
              <Label style={{ marginBottom: '1rem' }}>Prefix 4 Random Characters</Label>
              <div>
                <Toggle name="fourCharPrefix" checked={this.state.fourCharPrefix} onChange={this.toggleButton} />
              </div>
            </Col>
            <Col xs="2" className="d-flex flex-row justify-content-end align-items-end">
              <Button
                className="nButton"
                onClick={() => {
                  this.generateAddresses();
                }}
              >
                generate
              </Button>
            </Col>
            <Col xs="1" className="d-flex flex-row justify-content-end align-items-end">
              <Button
                className="nButton"
                onClick={() => {
                  this.copyToClipboard();
                }}
              >
                copy
              </Button>
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
