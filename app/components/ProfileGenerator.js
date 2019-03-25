import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Countries from '../store/countries';
import FontAwesome from 'react-fontawesome';
const TRANSLATIONS = [
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
  ['place', 'pl', 'plce', 'plac', 'plae', 'pplace', 'plaace']
];
const cardTypes = ['visa', 'mastercard'];
export default class ProfileGenerator extends Component {
  constructor() {
    super();
    this.countryNames = Object.keys(Countries);
    this.state = {
      cardNumber: '',
      cardType: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCVV: '',
      deliveryAddress: '',
      deliveryAptorSuite: '',
      deliveryCity: '',
      deliveryCountry: '',
      deliveryProvince: '',
      massCards: '',
      massCardModal: false,
      regionArrayShipping: [],
      cards: []
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  addCard = (cardNumber, cardType, cardExpiryMonth, cardExpiryYear, cardCVV) => {
    console.log('triggered');
    this.setState({
      cards: [
        ...this.state.cards,
        {
          cardNumber,
          cardType,
          cardExpiryMonth,
          cardExpiryYear,
          cardCVV
        }
      ]
    });
  };

  addMassCards = () => {
    this.toggleMassCardModal();
    const cards = this.state.massCards.split(/\n/);
    cards.forEach(card => {
      const cardArray = card.split(':');
      if (cardArray.length === 5 && cardTypes.includes(cardArray[1].toLowerCase())) {
        this.addCard(...cardArray);
      }
    });
  };

  removeCard = index => {
    console.log(index);
    console.log(this.state.cards.filter((card, cardIndex) => index !== cardIndex));
    this.setState({
      cards: [...this.state.cards.filter((card, cardIndex) => index !== cardIndex)]
    });
  };

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

  toggleMassCardModal = () => {
    this.setState({
      massCardModal: !this.state.massCardModal
    });
  };

  generateAddresses = () => {
    const addressString = `${this.state.deliveryAddress} ${this.state.deliveryAptorSuite}
    ${this.state.deliveryCity}, ${this.state.deliveryProvince}
    ${this.state.deliveryZip}
    ${this.state.deliveryCountry}`;

    const jigsSet = this.jigAddress(addressString);
    const jigs = Array.from(jigsSet).map(text => {
      return text
        .toLowerCase()
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    });
    console.log(jigs);
    if (jigs.length < parseInt(this.state.numberOfAddresses)) {
      this.setState({ jiggedAddress: jigs });
    } else {
      this.setState({ jiggedAddress: jigs.slice(0, parseInt(this.state.numberOfAddresses)) });
    }
  };

  returnCountry = (name, index) => <option key={`country-${index}`}>{name}</option>;

  returnCard = (card, index) => {
    return (
      <tr key={`Card - ${index}`}>
        <th>{index + 1}</th>
        <th>{card.cardNumber}</th>
        <th>{card.cardType}</th>
        <th>{card.cardExpiryMonth}</th>
        <th>{card.cardExpiryYear}</th>
        <th>{card.cardCVV}</th>
        <th>
          <FontAwesome
            name="trash"
            className="taskButton btn"
            onClick={() => {
              this.removeCard(index);
            }}
          />
        </th>
      </tr>
    );
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
                      <th>card number</th>
                      <th>card type</th>
                      <th>expiry month</th>
                      <th>expiry year</th>
                      <th>cvv</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>{this.state.cards.map(this.returnCard)}</tbody>
                </Table>
              </Col>
            </Row>
            <Row className="my-3">
              <Col xs="3">
                <Label>card number</Label>
                <Input type="text" name="cardNumber" onChange={this.handleChange} />
              </Col>
              <Col xs="2">
                <Label>card type</Label>
                <Input type="select" name="cardType" onChange={this.handleChange}>
                  <option>Mastercard</option>
                  <option>Visa</option>
                </Input>
              </Col>
              <Col xs="2">
                <Label>expiry month (mm)</Label>
                <Input type="text" name="cardExpiryMonth" onChange={this.handleChange} />
              </Col>
              <Col xs="2">
                <Label>expiry year (yyyy)</Label>
                <Input type="text" name="cardExpiryYear" onChange={this.handleChange} />
              </Col>
              <Col xs="1">
                <Label>cvv</Label>
                <Input type="text" name="cardCVV" onChange={this.handleChange} />
              </Col>
              <Col xs="1" className="d-flex flex-column justify-content-end">
                <Button
                  onClick={() => {
                    this.addCard(this.state.cardNumber, this.state.cardType, this.state.cardExpiryMonth, this.state.cardExpiryYear, this.state.cardCVV);
                  }}
                >
                  <FontAwesome name="plus" />
                </Button>
              </Col>
              <Col xs="1" className="d-flex flex-column justify-content-end">
                <Button onClick={this.toggleMassCardModal}>
                  <FontAwesome name="clipboard" />
                </Button>
              </Col>
            </Row>
            <Row className="my-3">
              <Col xs="3">
                <Label>address</Label>
                <Input type="text" name="deliveryAddress" value={this.state.deliveryAddress} onChange={this.handleChange} />
              </Col>
              <Col xs="1">
                <Label>apt,suite</Label>
                <Input type="text" name="deliveryAptorSuite" value={this.state.deliveryAptorSuite} onChange={this.handleChange} />
              </Col>
              <Col xs="2">
                <Label>city</Label>
                <Input type="text" name="deliveryCity" value={this.state.deliveryCity} onChange={this.handleChange} />
              </Col>
              <Col xs="2">
                <Label>country</Label>
                <Input
                  type="select"
                  name="deliveryCountry"
                  value={this.state.deliveryCountry}
                  onChange={event => {
                    this.setRegionArrayShipping(event.target.value);
                    this.handleChange(event);
                  }}
                >
                  <option value="" />
                  {this.countryNames.map(this.returnCountry)}
                </Input>
              </Col>
              <Col xs="2">
                <Label>region</Label>
                <Input type="select" name="deliveryProvince" value={this.state.deliveryProvince} onChange={this.handleChange}>
                  {this.state.regionArrayShipping !== null ? this.state.regionArrayShipping.map(this.returnCountry) : null}
                </Input>
              </Col>
              <Col xs="2">
                <Label>zip code</Label>
                <Input type="text" name="zipCode" value={this.state.zipCode} onChange={this.handleChange} />
              </Col>
            </Row>
            <Modal size="lg" isOpen={this.state.massCardModal} toggle={this.toggleMassCardModal} centered={true}>
              <ModalHeader style={{ borderBottom: 'none' }}>Mass Card Add</ModalHeader>
              <ModalBody>
                <Input
                  type="textarea"
                  name="massCards"
                  rows="20"
                  onChange={this.handleChange}
                  placeholder="cardNumber:cardType:cardExpiryMonth:cardExpiryYear:cardCVV&#10;4111111111111111:Visa:03:2020:123&#x0a;4242424242424242:Mastercard:03:2020:123"
                />
              </ModalBody>
              <ModalFooter>
                <Button className="nButton" onClick={this.addMassCards}>
                  Add
                </Button>
              </ModalFooter>
            </Modal>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
