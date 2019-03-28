import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup } from 'reactstrap';
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
const bots = ['Cybersole'];
export default class ProfileGenerator extends Component {
  constructor() {
    super();
    this.countryNames = Object.keys(Countries);
    this.state = {
      formdata: {
        profileID: '',
        deliveryCountry: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryFirstName: '',
        deliveryLastName: '',
        deliveryProvince: '',
        deliveryZip: '',
        deliveryAptorSuite: '',
        billingZip: '',
        billingCountry: '',
        billingAddress: '',
        billingCity: '',
        billingFirstName: '',
        billingLastName: '',
        billingProvince: '',
        billingAptorSuite: '',
        phoneNumber: '',
        paymentEmail: '',
        paymentCardholdersName: '',
        paymentCardnumber: '',
        paymentCardExpiryMonth: '',
        paymentCardExpiryYear: '',
        paymentCVV: ''
      },
      cardNumber: '',
      cardType: cardTypes[0],
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCVV: '',
      botType: bots[0],
      deliveryAddress: '',
      deliveryAptorSuite: '',
      deliveryCity: '',
      deliveryCountry: '',
      deliveryProvince: '',
      deliveryZip: '',
      massCards: '',
      massCardModal: false,
      profileModal: false,
      regionArrayShipping: [],
      regionArrayBilling: [],
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

  handleChangeShippingOrBilling = e => {
    this.setState({
      formdata: {
        ...this.state.formdata,
        [e.target.name]: e.target.value
      }
    });
  };

  addMassCards = () => {
    this.toggleMassCardModal();
    const cards = this.state.massCards.split(/\n/);
    const cardsArray = [];
    cards.forEach(card => {
      const cardArray = card.split(':');
      if (cardArray.length === 5 && cardTypes.includes(cardArray[1].toLowerCase())) {
        // this.addCard(...cardArray);
        cardsArray.push({
          cardNumber: cardArray[0],
          cardType: cardArray[1],
          cardExpiryMonth: cardArray[2],
          cardExpiryYear: cardArray[3],
          cardCVV: cardArray[4]
        });
      }
    });
    this.setState({
      cards: [...this.state.cards, ...cardsArray]
    });
  };

  setDeliveryToBilling = () => {
    this.setState({
      formdata: {
        ...this.state.formdata,
        billingCountry: this.state.formdata.deliveryCountry,
        billingAddress: this.state.formdata.deliveryAddress,
        billingCity: this.state.formdata.deliveryCity,
        billingFirstName: this.state.formdata.deliveryFirstName,
        billingLastName: this.state.formdata.deliveryLastName,
        billingProvince: this.state.formdata.deliveryProvince,
        billingZip: this.state.formdata.deliveryZip,
        billingAptorSuite: this.state.formdata.deliveryAptorSuite
      },
      regionArrayBilling: Countries[this.state.formdata.deliveryCountry] !== undefined ? Countries[this.state.formdata.deliveryCountry].provinces : []
    });
  };

  removeCard = index => {
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

  setRegionArrayBilling = countryName => {
    this.setState({
      regionArrayBilling: Countries[countryName].provinces
    });
    if (Countries[countryName].provinces !== null) {
      this.setState(prevState => ({
        formdata: {
          ...prevState.formdata,
          billingProvince: Countries[countryName].provinces[0]
        }
      }));
    } else {
      this.setState(prevState => ({
        formdata: {
          ...prevState.formdata,
          billingProvince: ''
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

  toggleProfileModal = () => {
    this.setState({
      profileModal: !this.state.profileModal
    });
  };

  generateAddresses = () => {
    const addressString = `${this.state.formdata.deliveryCountry}
${this.state.formdata.deliveryAddress}
${this.state.formdata.deliveryCity}
${this.state.formdata.deliveryFirstName}
${this.state.formdata.deliveryLastName}
${this.state.formdata.deliveryProvince}
${this.state.formdata.deliveryZip}
${this.state.formdata.deliveryAptorSuite}`;
    console.log(addressString);
    const jigsSet = this.jigAddress(addressString);
    const jigs = Array.from(jigsSet).map(text => {
      return text
        .toLowerCase()
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    });
    let jiggedAddress;
    if (jigs.length <= this.state.cards.length) {
      jiggedAddress = jigs;
      // this.setState({ jiggedAddress: jigs });
    } else {
      jiggedAddress = jigs.slice(0, this.state.cards.length);
      // this.setState({ jiggedAddress: jigs.slice(0, parseInt(this.state.numberOfAddresses)) });
    }
    jiggedAddress.forEach(address => {
      console.log(address);
      const [
        deliveryCountry,
        deliveryAddress,
        deliveryCity,
        deliveryFirstName,
        deliveryLastName,
        deliveryProvince,
        deliveryZip,
        deliveryAptorSuite
      ] = address.split(/\n/);
    });
  };

  returnCountry = (name, index) => <option key={`country-${index}`}>{name}</option>;

  returnOption = (name, index) => <option key={`${name} - ${index}}`}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>;

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

  exportAddressesAndCards = () => {
    const addressString = `${this.state.formdata.deliveryAddress}!@£${this.state.formdata.deliveryAptorSuite}!@£${this.state.formdata.deliveryCity}!@£${
      this.state.formdata.deliveryProvince
    }!@£${this.state.formdata.deliveryZip}!@£${this.state.formdata.deliveryCountry}`;
    const jigsSet = Array.from(this.jigAddress(addressString));
    const profiles = {};
    let jiggedAddress;
    if (jigsSet.length <= this.state.cards.length) {
      jiggedAddress = jigsSet;
    } else {
      jiggedAddress = jigsSet.slice(0, this.state.cards.length);
    }
    jiggedAddress.forEach((address, index) => {
      const [deliveryAddress, deliveryAptorSuite, deliveryCity, deliveryProvince, deliveryZip, deliveryCountry] = address.split('!@£');
      const card = this.state.card[index];
      switch (this.state.botType) {
        case 'Cybersole':
          profiles[`Profile - Card ${this.state.cards[index].cardNumber.slice(-4)}`] = {
            name: `Profile - Card ${this.state.cards[index].cardNumber.slice(-4)}`,
            payment: {
              email: 'test@gmail.com',
              phone: 'testnumber',
              card: {
                name: 'Mike Hunt',
                number: '4242 4242 4242 4242',
                exp_month: '01',
                exp_year: '2021',
                cvv: '123'
              }
            },
            delivery: {
              first_name: 'Mike',
              last_name: 'Hunt',
              addr1: deliveryAddress,
              addr2: '',
              zip: deliveryZip,
              city: deliveryCity,
              country: deliveryCountry,
              state: deliveryProvince,
              same_as_del: true
            },
            billing: {
              first_name: 'Mike',
              last_name: 'Hunt',
              addr1: '123 Main Street',
              addr2: '',
              zip: '90002',
              city: 'San Francisco',
              country: 'United States',
              state: 'California',
              same_as_del: true
            },
            one_checkout: false,
            favourite: false
          };
          break;
        default:
          break;
      }
    });
  };

  saveProfile = () => {
    const profile = { ...this.state.formdata, profileID: 'ProfileGeneratorProfile' };
    this.props.onAddProfile(profile);
    this.toggleProfileModal();
  };

  componentDidMount() {
    if (this.props.profiles.profiles.ProfileGeneratorProfile) {
      this.setState({ formdata: this.props.profiles.profiles.ProfileGeneratorProfile });
    }
  }

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
              <Col xs="2">
                <Label>card number</Label>
                <Input type="text" name="cardNumber" onChange={this.handleChange} />
              </Col>
              <Col xs="2">
                <Label>card type</Label>
                <Input type="select" name="cardType" onChange={this.handleChange}>
                  {cardTypes.map(this.returnOption)}
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
                <Button onClick={this.toggleProfileModal}>
                  <FontAwesome name="id-badge" />
                </Button>
              </Col>
              <Col xs="1" className="d-flex flex-column justify-content-end">
                <Button onClick={this.toggleMassCardModal}>
                  <FontAwesome name="clipboard" />
                </Button>
              </Col>
            </Row>
            {/* <Row className="my-3">
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
                <Input type="text" name="deliveryZip" value={this.state.deliveryZip} onChange={this.handleChange} />
              </Col>
            </Row> */}
            <Row className="my-3">
              <Col xs="2">
                <Label>bot</Label>
                <Input type="select" name="botType" onChange={this.handleChange}>
                  {bots.map(this.returnOption)}
                </Input>
              </Col>
              <Col xs="2" className="d-flex flex-column justify-content-end">
                <Button onClick={this.exportAddressesAndCards}>export</Button>
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
            <Modal size="lg" isOpen={this.state.profileModal} toggle={this.toggleProfileModal} centered={true}>
              <ModalHeader style={{ borderBottom: 'none' }}>Profile</ModalHeader>
              <ModalBody>
                <Row className="activeContainerInner">
                  <Col xs="6">
                    <h6 style={{ fontWeight: 600 }}>delivery address</h6>
                    <Form>
                      <FormGroup row>
                        <Col xs="6">
                          <Label for="store">first name</Label>
                          <Input
                            type="text"
                            name="deliveryFirstName"
                            id="deliveryFirstName"
                            value={this.state.formdata.deliveryFirstName}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                        <Col xs="6">
                          <Label for="store">last name</Label>
                          <Input
                            type="text"
                            name="deliveryLastName"
                            id="deliveryLastName"
                            value={this.state.formdata.deliveryLastName}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col xs="9">
                          <Label for="store">address</Label>
                          <Input
                            type="text"
                            name="deliveryAddress"
                            id="deliveryAddress"
                            value={this.state.formdata.deliveryAddress}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                        <Col xs="3">
                          <Label for="store">apt,suite</Label>
                          <Input
                            type="text"
                            name="deliveryAptorSuite"
                            id="deliveryAptorSuite"
                            value={this.state.formdata.deliveryAptorSuite}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
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
                            value={this.state.formdata.deliveryCity}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
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
                            value={this.state.formdata.deliveryCountry}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
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
                            value={this.state.formdata.deliveryProvince}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          >
                            {/* {this.state.regionArrayShipping !== null && this.state.regionArrayShipping !== [] ? (
                        this.state.formdata.deliveryProvince !== null && this.state.formdata.deliveryProvince !== '' ? (
                          <option key="country-load">{this.state.formdata.deliveryProvince}</option>
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
                            value={this.state.formdata.deliveryZip}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                    </Form>
                  </Col>
                  <Col xs="6">
                    <h6 style={{ fontWeight: 600 }}>billing address</h6>
                    <Form>
                      <FormGroup row>
                        <Col xs="6">
                          <Label for="store">first name</Label>
                          <Input
                            type="text"
                            name="billingFirstName"
                            id="billingFirstName"
                            value={this.state.formdata.billingFirstName}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                        <Col xs="6">
                          <Label for="store">last name</Label>
                          <Input
                            type="text"
                            name="billingLastName"
                            id="billingLastName"
                            value={this.state.formdata.billingLastName}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col xs="9">
                          <Label for="store">address</Label>
                          <Input
                            type="text"
                            name="billingAddress"
                            id="billingAddress"
                            value={this.state.formdata.billingAddress}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                        <Col xs="3">
                          <Label for="store">apt,suite</Label>
                          <Input
                            type="text"
                            name="billingAptorSuite"
                            id="billingAptorSuite"
                            value={this.state.formdata.billingAptorSuite}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col xs="12">
                          <Label for="store">city</Label>
                          <Input
                            type="text"
                            name="billingCity"
                            id="billingCity"
                            value={this.state.formdata.billingCity}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col xs="4">
                          <Label for="store">country</Label>
                          <Input
                            type="select"
                            name="billingCountry"
                            id="billingCountry"
                            value={this.state.formdata.billingCountry}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                              this.setRegionArrayBilling(event.target.value);
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
                            name="billingProvince"
                            id="billingProvince"
                            value={this.state.formdata.billingProvince}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          >
                            {this.state.regionArrayBilling !== null ? this.state.regionArrayBilling.map(this.returnCountry) : null}
                          </Input>
                        </Col>
                        <Col xs="4">
                          <Label for="store">zip code</Label>
                          <Input
                            type="text"
                            name="billingZip"
                            id="billingZip"
                            value={this.state.formdata.billingZip}
                            onChange={event => {
                              this.handleChangeShippingOrBilling(event);
                            }}
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col xs="12">
                          <Label for="store">
                            <Button
                              onClick={() => {
                                this.setDeliveryToBilling();
                              }}
                            >
                              copy delivery
                            </Button>
                            {/* <Input
                      type="checkbox"
                      name="sameDeliveryBilling"
                      id="sameDeliveryBilling"
                      onChange={}
                    /> */}
                          </Label>
                        </Col>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button className="nButton" onClick={this.saveProfile}>
                  Save
                </Button>
              </ModalFooter>
            </Modal>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
