import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  Button,
  CustomInput
} from 'reactstrap';
import PropTypes from 'prop-types';
import { withToastManager } from 'react-toast-notifications';
import { cardTypes } from '../../constants/constants';
import { jigAddresses } from '../AddressJigger/functions';
import {
  convertBaseToCybersole,
  convertBaseToProjectDestroyer,
  convertBaseToGhost,
  convertBaseToBalko,
  convertBaseToEVEAIO,
  convertBaseToPhantom,
  convertBaseToDashe,
  convertBaseToTKS,
  convertBaseToHastey,
  convertBaseToKodai,
  convertBaseToNSB,
  convertBaseToSOLEAIO,
  convertBaseToNeutrinoRaffle,
  convertBaseToCSV
} from './functions';

import Countries from '../../constants/countries';
import Table from '../Table/index';

const { dialog } = require('electron').remote;
const randomName = require('random-name');
const converter = require('json-2-csv');
const fs = require('fs');

const bots = [
  'Cybersole',
  'Project Destroyer',
  'Ghost',
  'Balko',
  'EVE AIO',
  'Phantom',
  'Dashe',
  'TKS',
  'Hastey',
  'Kodai',
  'NSB',
  'SOLE AIO',
  'Neutrino Raffle',
  'CSV'
];

class ProfileCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      cardsInput: '',
      sameDeliveryBillingBool: false,
      oneCheckoutBool: false,
      randomNameBool: false,
      randomPhoneNumberBool: false,
      useCatchallBool: false,
      jigAddressesBool: false,
      fourCharPrefixBool: false,
      randomPhoneNumberTemplate: '',
      email: '',
      phone: '',
      deliveryAddress: '',
      deliveryFirstName: '',
      deliveryLastName: '',
      deliveryCity: '',
      deliveryApt: '',
      deliveryCountry: '',
      deliveryRegion: '',
      deliveryZip: '',
      billingAddress: '',
      billingFirstName: '',
      billingLastName: '',
      billingCity: '',
      billingApt: '',
      billingCountry: '',
      billingRegion: '',
      billingZip: ''
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleToggleChange = e => {
    const { name } = e.target;
    this.setState(prevState => ({
      [name]: !prevState[name]
    }));
  };

  addCards = () => {
    const { cardsInput, cards } = this.state;
    const cardsArray = [];
    const splitCardsArray = cardsInput.split(/\n/);
    splitCardsArray.forEach(card => {
      const cardArray = card.split(':');
      if (
        cardArray.length === 5 &&
        cardTypes.includes(cardArray[1].toLowerCase())
      ) {
        cardsArray.push({
          cardNumber: cardArray[0],
          cardType: cardArray[1],
          expMonth: cardArray[2],
          expYear: cardArray[3],
          cvv: cardArray[4]
        });
      }
    });
    this.setState({
      cards: [...cards, ...cardsArray],
      cardsInput: ''
    });
  };

  copyDeliveryToBilling = () => {
    const {
      deliveryAddress,
      deliveryFirstName,
      deliveryLastName,
      deliveryCity,
      deliveryApt,
      deliveryCountry,
      deliveryRegion,
      deliveryZip
    } = this.state;
    this.setState({
      billingAddress: deliveryAddress,
      billingFirstName: deliveryFirstName,
      billingLastName: deliveryLastName,
      billingCity: deliveryCity,
      billingApt: deliveryApt,
      billingCountry: deliveryCountry,
      billingRegion: deliveryRegion,
      billingZip: deliveryZip
    });
  };

  clearCards = () => {
    this.setState({
      cards: []
    });
  };

  returnFileExtension = botName => {
    switch (botName) {
      case 'CSV':
        return 'csv';
      case 'Kodai':
        return 'txt';
      default:
        return 'json';
    }
  };

  convertProfiles = profiles => {
    const { bot } = this.state;
    if (
      [
        'Project Destroyer',
        'Hastey',
        'EVE AIO',
        'Phantom',
        'CSV',
        'NSB',
        'SOLE AIO'
      ].includes(bot)
    ) {
      return Object.values(profiles);
    }
    if (bot === 'TKS') {
      return { Profiles: Object.values(profiles) };
    }
    return profiles;
  };

  exportProfiles = async () => {
    const {
      bot,
      jigAddressesBool,
      deliveryFirstName,
      deliveryLastName,
      deliveryAddress,
      deliveryCity,
      deliveryApt,
      deliveryRegion,
      deliveryCountry,
      deliveryZip,
      cards,
      fourCharPrefixBool,
      sameDeliveryBillingBool,
      oneCheckoutBool,
      randomNameBool,
      randomPhoneNumberBool,
      useCatchallBool,
      billingAddress,
      billingFirstName,
      billingLastName,
      billingCity,
      billingApt,
      billingCountry,
      billingRegion,
      billingZip,
      email,
      phone
    } = this.state;
    const { toastManager } = this.props;
    const addresses = jigAddressesBool
      ? jigAddresses(
          deliveryAddress,
          deliveryCity,
          deliveryApt,
          deliveryRegion,
          deliveryCountry,
          deliveryZip,
          fourCharPrefixBool,
          cards.length
        )
      : Array(cards.length).fill(
          `${deliveryAddress}\n${deliveryCity}\n${deliveryApt}\n${deliveryRegion}\n${deliveryCountry}\n${deliveryZip}`
        );
    const jiggedAddress =
      addresses.length <= cards.length
        ? addresses
        : addresses.slice(0, cards.length);
    const convertedProfiles = jiggedAddress
      .map((address, index) => {
        const [
          splitDeliveryAddress,
          splitDeliveryCity,
          splitDeliveryApt,
          splitDeliveryRegion,
          splitDeliveryCountry,
          splitDeliveryZip
        ] = address.split('\n');
        const profile = {
          jigAddressesBool,
          deliveryFirstName,
          deliveryLastName,
          deliveryAddress: splitDeliveryAddress,
          deliveryCity: splitDeliveryCity,
          deliveryApt: splitDeliveryApt,
          deliveryRegion: splitDeliveryRegion,
          deliveryCountry: splitDeliveryCountry,
          deliveryZip: splitDeliveryZip,
          fourCharPrefixBool,
          sameDeliveryBillingBool,
          oneCheckoutBool,
          randomNameBool,
          randomPhoneNumberBool,
          useCatchallBool,
          billingAddress,
          billingFirstName,
          billingLastName,
          billingCity,
          billingApt,
          billingCountry,
          billingRegion,
          billingZip,
          email,
          phone
        };
        const card = cards[index];
        const randomFirstName = randomNameBool ? randomName.first() : '';
        const randomLastName = randomNameBool ? randomName.last() : '';
        switch (bot) {
          case 'Cybersole':
            return convertBaseToCybersole(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Project Destroyer':
            return convertBaseToProjectDestroyer(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Ghost':
            return convertBaseToGhost(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'EVE AIO':
            return convertBaseToBalko(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Phantom':
            return convertBaseToEVEAIO(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Dashe':
            return convertBaseToPhantom(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Hastey':
            return convertBaseToDashe(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Kodai':
            return convertBaseToTKS(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Neutrino Raffle':
            return convertBaseToHastey(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'TKS':
            return convertBaseToKodai(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'CSV':
            return convertBaseToNSB(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'NSB':
            return convertBaseToSOLEAIO(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'SOLE AIO':
            return convertBaseToNeutrinoRaffle(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          case 'Balko':
            return convertBaseToCSV(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName
            );
          default:
            return undefined;
        }
      })
      .filter(profile => profile !== undefined);
    const name = `${bot} - Profiles`;
    const extension = this.returnFileExtension(bot);
    let file;
    if (bot === 'CSV') {
      file = await converter.json2csvAsync(
        this.convertProfiles(convertedProfiles)
      );
    } else {
      file = JSON.stringify(this.convertProfiles(convertedProfiles));
    }
    dialog.showSaveDialog(
      {
        title: 'name',
        defaultPath: `~/${name}.${extension}`
      },
      fileName => {
        if (fileName === undefined) {
          return;
        }
        fs.writeFile(fileName, file, err => {
          if (err.message !== `"ENOENT: no such file or directory, open ''"`) {
            toastManager.add('Failed to export profiles', {
              appearance: 'error',
              autoDismiss: true,
              pauseOnHover: true
            });
          }
        });
      }
    );
  };

  render() {
    const {
      randomNameBool,
      randomPhoneNumberBool,
      useCatchallBool,
      cards,
      cardsInput,
      deliveryAddress,
      deliveryFirstName,
      deliveryLastName,
      deliveryCity,
      deliveryApt,
      deliveryCountry,
      deliveryRegion,
      deliveryZip,
      billingAddress,
      billingFirstName,
      billingLastName,
      billingCity,
      billingApt,
      billingCountry,
      billingRegion,
      billingZip
    } = this.state;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Card Number',
        accessor: 'cardNumber'
      },
      {
        Header: 'Card Type',
        accessor: 'cardType'
      },
      {
        Header: 'Exp Month',
        accessor: 'expMonth'
      },
      {
        Header: 'Exp Year',
        accessor: 'expYear'
      },
      {
        Header: 'CVV',
        accessor: 'cvv'
      }
    ];
    return (
      <Row className="h-100 p-0">
        <Col className="panel-left h-100" xs="6">
          <h5 className="my-3">Main Profile</h5>
          <Container fluid className="px-0 noselect">
            <Row className="px-0">
              {useCatchallBool ? (
                <Col>
                  <Label>Catchall</Label>
                  <Input
                    type="text"
                    id="catchallEmail"
                    name="catchallEmail"
                    placeholder="example.com"
                    onChange={this.handleChange}
                  />
                </Col>
              ) : (
                <Col>
                  <Label>Email</Label>
                  <Input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    onChange={this.handleChange}
                  />
                </Col>
              )}
              {randomPhoneNumberBool ? (
                <Col>
                  <Label>Phone Template</Label>
                  <Input
                    type="text"
                    id="randomPhoneNumberTemplate"
                    name="randomPhoneNumberTemplate"
                    placeholder="+44######### #->random number"
                    onChange={this.handleChange}
                  />
                </Col>
              ) : (
                <Col>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    id="phone"
                    name="phone"
                    placeholder="12345678910"
                    onChange={this.handleChange}
                  />
                </Col>
              )}
            </Row>
            <Row>
              <Col>
                <h6 className="d-block mt-5 mb-2">Delivery Address</h6>
              </Col>
              <Col>
                <h6 className="d-block mt-5 mb-2">Billing Address</h6>
              </Col>
            </Row>
            {randomNameBool ? null : (
              <Row className="mt-3 mb-3">
                <Col>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={deliveryAddress}
                    placeholder="John"
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    id="deliveryFirstName"
                    name="deliveryFirstName"
                    value={deliveryFirstName}
                    placeholder="Doe"
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    id="billingFirstName"
                    name="billingFirstName"
                    value={billingFirstName}
                    placeholder="John"
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    id="billingLastName"
                    name="billingLastName"
                    value={billingLastName}
                    placeholder="Doe"
                    onChange={this.handleChange}
                  />
                </Col>
              </Row>
            )}
            <Row className="mt-3 mb-3">
              <Col>
                <Label>Address</Label>
                <Input
                  type="text"
                  id="deliveryLastName"
                  name="deliveryLastName"
                  value={deliveryLastName}
                  placeholder="John"
                  onChange={this.handleChange}
                />
              </Col>
              <Col>
                <Label>Address</Label>
                <Input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={billingAddress}
                  placeholder="John"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col xs="4">
                <Label>City</Label>
                <Input
                  type="text"
                  id="deliveryCity"
                  name="deliveryCity"
                  value={deliveryCity}
                  placeholder="John"
                  onChange={this.handleChange}
                />
              </Col>
              <Col>
                <Label>Apt</Label>
                <Input
                  type="text"
                  id="deliveryApt"
                  name="deliveryApt"
                  value={deliveryApt}
                  placeholder="123"
                  onChange={this.handleChange}
                />
              </Col>
              <Col xs="4">
                <Label>City</Label>
                <Input
                  type="text"
                  id="billingCity"
                  name="billingCity"
                  value={billingCity}
                  placeholder="John"
                  onChange={this.handleChange}
                />
              </Col>
              <Col>
                <Label>Apt</Label>
                <Input
                  type="text"
                  id="billingApt"
                  name="billingApt"
                  value={billingApt}
                  placeholder="123"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col>
                <Label>Country</Label>
                <Input
                  type="select"
                  id="deliveryCountry"
                  name="deliveryCountry"
                  value={deliveryCountry}
                  placeholder="John"
                  onChange={this.handleChange}
                >
                  <option value="">Select a delivery country</option>
                  {Object.keys(Countries).map(country => (
                    <option value={country}>{country}</option>
                  ))}
                </Input>
              </Col>
              <Col>
                <Label>Country</Label>
                <Input
                  type="select"
                  id="billingCountry"
                  name="billingCountry"
                  value={billingCountry}
                  onChange={this.handleChange}
                >
                  <option value="">Select a billing country</option>
                  {Object.keys(Countries).map(country => (
                    <option value={country}>{country}</option>
                  ))}
                </Input>
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col xs="4">
                <Label>Region</Label>
                <Input
                  type="select"
                  id="deliveryRegion"
                  name="deliveryRegion"
                  value={deliveryRegion}
                  onChange={this.handleChange}
                >
                  <option value="">Select a delivery region</option>
                  {deliveryCountry !== ''
                    ? Countries[deliveryCountry].provinces.map(country => (
                        <option value={country}>{country}</option>
                      ))
                    : null}
                </Input>
              </Col>
              <Col>
                <Label>Zip</Label>
                <Input
                  type="text"
                  id="deliveryZip"
                  name="deliveryZip"
                  value={deliveryZip}
                  placeholder="123456"
                  onChange={this.handleChange}
                />
              </Col>
              <Col xs="4">
                <Label>Region</Label>
                <Input
                  type="select"
                  id="billingRegion"
                  name="billingRegion"
                  value={billingRegion}
                  placeholder="John"
                  onChange={this.handleChange}
                >
                  <option value="">Select a billing region</option>
                  {billingCountry !== ''
                    ? Countries[billingCountry].provinces.map(country => (
                        <option value={country}>{country}</option>
                      ))
                    : null}
                </Input>
              </Col>
              <Col>
                <Label>Zip</Label>
                <Input
                  type="text"
                  id="billingZip"
                  name="billingZip"
                  value={billingZip}
                  placeholder="123456"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row className="my-4">
              <Col xs={{ size: 6, offset: 6 }}>
                <Button onClick={this.copyDeliveryToBilling}>
                  Copy Delivery
                </Button>
              </Col>
            </Row>
            <Row>
              <Col xs="4" className="my-2">
                <Label>Same Delivery/Billing</Label>
                <CustomInput
                  type="switch"
                  id="sameDeliveryBillingBool"
                  name="sameDeliveryBillingBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>One Checkout</Label>
                <CustomInput
                  type="switch"
                  id="oneCheckoutBool"
                  name="oneCheckoutBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Name</Label>
                <CustomInput
                  type="switch"
                  id="randomNameBool"
                  name="randomNameBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Phone Number</Label>
                <CustomInput
                  type="switch"
                  id="randomPhoneNumberBool"
                  name="randomPhoneNumberBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Use Catchall</Label>
                <CustomInput
                  type="switch"
                  id="useCatchallBool"
                  name="useCatchallBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Jig Addresses</Label>
                <CustomInput
                  type="switch"
                  id="jigAddressesBool"
                  name="jigAddressesBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>4 Char Prefix</Label>
                <CustomInput
                  type="switch"
                  id="fourCharPrefixBool"
                  name="fourCharPrefixBool"
                  onChange={this.handleToggleChange}
                />
              </Col>
            </Row>
          </Container>
        </Col>
        <Col>
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: cards,
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
            <Row className="py-3 align-items-end noselect">
              <Col>
                <Label>Cards</Label>
                <Input
                  id="cardsInput"
                  name="cardsInput"
                  type="textarea"
                  rows="4"
                  value={cardsInput}
                  placeholder="Card Number:Card Type:Exp Month:Exp Year:CVV&#10;e.g 4111111111111111:Visa:03:2020:123&#x0a;e.g 4242424242424242:Mastercard:03:2020:123"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row className="py-3 align-items-end noselect">
              <Col>
                <Button onClick={this.addCards}>Add Cards</Button>
              </Col>
              <Col>
                <Button onClick={this.clearCards}>Clear Cards</Button>
              </Col>
            </Row>
            <Row className="py-3 align-items-end noselect">
              <Col>
                <Input
                  type="select"
                  id="bot"
                  name="bot"
                  onChange={this.handleChange}
                >
                  <option value="">Select a bot</option>
                  {bots.map(bot => (
                    <option value={bot}>{bot}</option>
                  ))}
                </Input>
              </Col>
              <Col>
                <Button onClick={this.exportProfiles}>Export Profiles</Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

ProfileCreator.propTypes = {
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired
};

export default withToastManager(ProfileCreator);
