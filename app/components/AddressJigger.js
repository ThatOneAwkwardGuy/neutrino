import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup, Form } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const TRANSLATIONS = [
  ['street', 'st.', 'st'],
  ['drive', 'dr.', 'dr'],
  ['lane', 'ln.', 'ln'],
  ['avenue', 'ave.', 'ave'],
  ['west', 'w.', 'w'],
  ['east', 'e.', 'e'],
  ['north', 'n.', 'n'],
  ['south', 's.', 's'],
  ['east', 'e.', 'e'],
  ['boulevard', 'blvd', 'blvd.'],
  ['mountain', 'mtn.', 'mtn']
];
export default class AddressJigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryCountry: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryProvince: '',
      deliveryZip: '',
      deliveryAptorSuite: '',
      numberOfAddresses: '1',
      jiggedAddress: []
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  jigAddress = addressString => {
    jigs = new Set([addressString]);
    lines = addressString.split('\n');
    parts = lines[0].split(' ');
    console.log('Address Lines: ' + lines);
    console.log('Address parts: ' + parts);
    for (var index = 0; index < parts.length; index++) {
      part = parts[index];
      TRANSLATIONS.forEach(entry => {
        possibleJigs = [];
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
            fullJig = '';
            valueLines = address.split('\n');
            valueParts = valueLines[0].split(' ');
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
          addressParts = address.split(' ');
          for (var i = 2; i < addressParts.length; i++) {
            if (addressParts.length == 3) {
              if (addressParts[2].length < 3) {
                continue;
              }
            }
            splitAddress = '';
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

  generateAddresses = () => {
    const addressString = `${this.state.deliveryAddress} ${this.state.deliveryAptorSuite}
    ${this.state.deliveryCity}, ${this.state.deliveryProvince}
    ${this.state.deliveryZip}
    ${this.state.deliveryCountry}`;

    const jigs = this.jigAddress(addressString);

    if (jigs.length < parseInt(this.state.numberOfAddresses)) {
      this.setState({ jiggedAddress: jigs });
    } else {
      this.setState({ jiggedAddress: jigs.slice(0, parseInt(this.state.numberOfAddresses)) });
    }
  };

  returnJiggedAddresses = addressArray => {
    return addressArray.map(elem => <Col>{elem}</Col>);
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">{this.returnJiggedAddresses(this.state.jiggedAddress)}</Row>
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
            <Col xs="2">
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
          </FormGroup>
          <FormGroup row>
            <Col xs="12">
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
          </FormGroup>
          <FormGroup row>
            <Col xs="4">
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
            <Col xs="4">
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
                {/* {this.state.regionArrayShipping !== null && this.state.regionArrayShipping !== [] ? (
                        this.state.deliveryProvince !== null && this.state.deliveryProvince !== '' ? (
                          <option key="country-load">{this.state.deliveryProvince}</option>
                        ) : (
                          this.state.regionArrayShipping.map(this.returnCountry)
                        )
                      ) : null} */}
                {this.state.regionArrayShipping !== null ? this.state.regionArrayShipping.map(this.returnCountry) : null}
              </Input>
            </Col>
            <Col xs="4">
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
          </FormGroup>
          <FormGroup row>
            <Col xs="4">
              <Label for="numberOfAddresses">number</Label>
              <Input
                name="numberOfAddresses"
                value={this.state.numberOfAddresses}
                onChange={e => {
                  this.handleChange(e);
                }}
                type="number"
              />
            </Col>
            <Col xs="4">
              <Label for="numberOfAddresses">number</Label>
              <Button
                onClick={() => {
                  this.generateAddresses();
                }}
              >
                generate
              </Button>
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
