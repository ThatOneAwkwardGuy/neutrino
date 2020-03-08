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
import { Tooltip } from 'react-tippy';
import PropTypes from 'prop-types';
import { withToastManager } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  convertBaseToCSV,
  convertBaseToNeutrino,
  convertBaseToAdept,
  generateGmailDotTrick
} from './functions';
import { generateUEID } from '../../utils/utils';

import Countries from '../../constants/countries';
import Table from '../Table/index';

const { dialog } = require('electron').remote;
const randomName = require('random-name');
const converter = require('json-2-csv');
const fs = require('fs');
const fsPromises = require('fs').promises;

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
  'Neutrino',
  'Adept',
  'CSV'
];

class ProfileCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      cardsInput: '',
      profileQty: 1,
      sameDeliveryBillingBool: false,
      oneCheckoutBool: false,
      randomNameBool: false,
      randomPhoneNumberBool: false,
      useCatchallBool: false,
      jigAddressesBool: false,
      fourCharPrefixBool: false,
      randomPhoneNumberTemplate: '',
      catchallEmail: '',
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
      billingZip: '',
      password: '',
      instagram: ''
    };
  }

  componentDidMount() {
    const { profile } = this.props;
    this.setState(prevState => ({
      ...prevState,
      ...profile
    }));
  }

  saveProfile = () => {
    const { updateProfile, toastManager } = this.props;
    const {
      sameDeliveryBillingBool,
      oneCheckoutBool,
      randomNameBool,
      randomPhoneNumberBool,
      useCatchallBool,
      jigAddressesBool,
      fourCharPrefixBool,
      randomPhoneNumberTemplate,
      catchallEmail,
      email,
      phone,
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
      billingZip,
      instagram
    } = this.state;
    updateProfile({
      sameDeliveryBillingBool,
      oneCheckoutBool,
      randomNameBool,
      randomPhoneNumberBool,
      useCatchallBool,
      jigAddressesBool,
      fourCharPrefixBool,
      randomPhoneNumberTemplate,
      catchallEmail,
      email,
      phone,
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
      billingZip,
      instagram
    });
    toastManager.add('Saved profile', {
      appearance: 'success',
      autoDismiss: true,
      pauseOnHover: true
    });
  };

  clearProfile = () => {
    const { clearProfileAttributes, toastManager } = this.props;
    clearProfileAttributes();
    this.setState({
      cardsInput: '',
      sameDeliveryBillingBool: false,
      oneCheckoutBool: false,
      randomNameBool: false,
      randomPhoneNumberBool: false,
      useCatchallBool: false,
      jigAddressesBool: false,
      fourCharPrefixBool: false,
      randomPhoneNumberTemplate: '',
      catchallEmail: '',
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
    });
    toastManager.add('Cleared profile', {
      appearance: 'success',
      autoDismiss: true,
      pauseOnHover: true
    });
  };

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
    const { addCards } = this.props;
    const { cardsInput } = this.state;
    addCards(cardsInput);
    this.setState({
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

  loadEmails = async () => {
    const filePaths = await dialog.showOpenDialog(null, {
      filters: [{ name: 'Emails and Passes Text File', extensions: ['txt'] }]
    });
    if (!filePaths.canceled) {
      const filePath = filePaths.filePaths[0];
      const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
      if (filePath.split('.').slice(-1)[0] === 'txt') {
        const emails = file.split('\n');
        this.setState({ emails, quantity: emails.length });
      }
    }
  };

  exportProfiles = async () => {
    const {
      bot,
      profileQty,
      jigAddressesBool,
      deliveryFirstName,
      deliveryLastName,
      deliveryAddress,
      deliveryCity,
      deliveryApt,
      deliveryRegion,
      deliveryCountry,
      deliveryZip,
      fourCharPrefixBool,
      sameDeliveryBillingBool,
      oneCheckoutBool,
      randomNameBool,
      randomPhoneNumberBool,
      randomPhoneNumberTemplate,
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
      password,
      instagram,
      phone,
      catchallEmail
    } = this.state;
    const { cards } = this.props;
    const { toastManager } = this.props;
    if (bot === '' || bot === undefined) {
      toastManager.add('Select a bot to export profiles for.', {
        appearance: 'error',
        autoDismiss: true,
        pauseOnHover: true
      });
      return;
    }
    const usableCards =
      cards.length > 0
        ? cards
        : Array(parseInt(profileQty, 10)).fill({
            cardNumber: '4111111111111111',
            cardType: 'Visa',
            expMonth: '03',
            expYear: '2020',
            cvv: '123'
          });
    const addresses = jigAddressesBool
      ? jigAddresses(
          deliveryAddress,
          deliveryCity,
          deliveryApt,
          deliveryRegion,
          deliveryCountry,
          deliveryZip,
          fourCharPrefixBool,
          usableCards.length
        )
      : Array(usableCards.length).fill(
          `${deliveryAddress}\n${deliveryCity}\n${deliveryApt}\n${deliveryRegion}\n${deliveryCountry}\n${deliveryZip}`
        );

    const jiggedAddress =
      addresses.length <= usableCards.length || usableCards.length === 0
        ? addresses
        : addresses.slice(0, usableCards.length);
    const emails = catchallEmail.includes('@gmail')
      ? generateGmailDotTrick(jiggedAddress.length, email)
      : [];
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
          randomPhoneNumberTemplate,
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
          password,
          instagram,
          phone,
          catchallEmail
        };
        const card =
          usableCards[index] !== undefined
            ? usableCards[index]
            : {
                paymentCardholdersName: '',
                cardNumber: '',
                expMonth: '',
                expYear: '',
                cvv: ''
              };
        const randomFirstName = randomName.first();
        const randomLastName = randomName.last();
        switch (bot) {
          case 'Cybersole':
            return convertBaseToCybersole(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Project Destroyer':
            return convertBaseToProjectDestroyer(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Ghost':
            return convertBaseToGhost(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'EVE AIO':
            return convertBaseToEVEAIO(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Phantom':
            return convertBaseToPhantom(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Dashe':
            return convertBaseToDashe(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Hastey':
            return convertBaseToHastey(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Kodai':
            return convertBaseToKodai(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'TKS':
            return convertBaseToTKS(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'CSV':
            return convertBaseToCSV(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'NSB':
            return convertBaseToNSB(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'SOLE AIO':
            return convertBaseToSOLEAIO(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Balko':
            return convertBaseToBalko(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Neutrino':
            return convertBaseToNeutrino(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
            );
          case 'Adept':
            return convertBaseToAdept(
              index,
              profile,
              card,
              randomFirstName,
              randomLastName,
              emails
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
    const filePaths = await dialog.showSaveDialog({
      title: 'name',
      defaultPath: `~/${name}.${extension}`
    });
    if (!filePaths.canceled) {
      fs.writeFile(filePaths.filePath, file, err => {
        if (err.message !== `"ENOENT: no such file or directory, open ''"`) {
          toastManager.add('Failed to export profiles', {
            appearance: 'error',
            autoDismiss: true,
            pauseOnHover: true
          });
        }
      });
    }
  };

  render() {
    const {
      bot,
      randomNameBool,
      randomPhoneNumberBool,
      useCatchallBool,
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
      billingZip,
      catchallEmail,
      email,
      password,
      instagram,
      randomPhoneNumberTemplate,
      phone,
      cardsInput,
      profileQty,
      sameDeliveryBillingBool,
      oneCheckoutBool,
      jigAddressesBool,
      fourCharPrefixBool
    } = this.state;
    const { cards, clearCards } = this.props;
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
        <Col className="panel-left h-100 display-scrollbar" xs="6">
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
                    value={catchallEmail}
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
                    value={email}
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
                    value={randomPhoneNumberTemplate}
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
                    value={phone}
                    placeholder="12345678910"
                    onChange={this.handleChange}
                  />
                </Col>
              )}
            </Row>
            <Row className="mt-3">
              <Col xs="6">
                <Label>Password</Label>
                <Input
                  type="text"
                  id="password"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={this.handleChange}
                />
              </Col>
              <Col xs="6">
                <Label>Instagram</Label>
                <Input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={instagram}
                  placeholder="Instagram"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <h6 className="d-block mt-4 mb-2">Delivery Address</h6>
              </Col>
              <Col>
                <h6 className="d-block mt-4 mb-2">Billing Address</h6>
              </Col>
            </Row>
            {randomNameBool ? null : (
              <Row className="my-3">
                <Col>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    id="deliveryFirstName"
                    name="deliveryFirstName"
                    value={deliveryFirstName}
                    placeholder="John"
                    onChange={this.handleChange}
                  />
                </Col>
                <Col>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    id="deliveryLastName"
                    name="deliveryLastName"
                    value={deliveryLastName}
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
            <Row className="my-3">
              <Col>
                <Label>Address</Label>
                <Input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={deliveryAddress}
                  placeholder="123 Test Street"
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
                  placeholder="123 Test Street"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row className="my-3">
              <Col xs="4">
                <Label>City</Label>
                <Input
                  type="text"
                  id="deliveryCity"
                  name="deliveryCity"
                  value={deliveryCity}
                  placeholder="New York"
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
                  placeholder="New York"
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
            <Row className="my-3">
              <Col>
                <Label>Country</Label>
                <Input
                  type="select"
                  id="deliveryCountry"
                  name="deliveryCountry"
                  value={deliveryCountry}
                  onChange={this.handleChange}
                >
                  <option key={generateUEID()} value="">
                    Select a delivery country
                  </option>
                  {Object.keys(Countries).map(country => (
                    <option key={generateUEID()} value={country}>
                      {country}
                    </option>
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
                  <option key={generateUEID()} value="">
                    Select a billing country
                  </option>
                  {Object.keys(Countries).map(country => (
                    <option key={generateUEID()} value={country}>
                      {country}
                    </option>
                  ))}
                </Input>
              </Col>
            </Row>
            <Row className="my-3">
              <Col xs="4">
                <Label>Region</Label>
                <Input
                  type="select"
                  id="deliveryRegion"
                  name="deliveryRegion"
                  value={deliveryRegion}
                  onChange={this.handleChange}
                >
                  <option key={generateUEID()} value="">
                    Select a delivery region
                  </option>
                  {deliveryCountry !== ''
                    ? Countries[deliveryCountry].provinces.map(country => (
                        <option key={generateUEID()} value={country}>
                          {country}
                        </option>
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
                  onChange={this.handleChange}
                >
                  <option key={generateUEID()} value="">
                    Select a billing region
                  </option>
                  {billingCountry !== ''
                    ? Countries[billingCountry].provinces.map(country => (
                        <option key={generateUEID()} value={country}>
                          {country}
                        </option>
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
              {/* <Col xs="6" className="text-right">
                <Tooltip
                  arrow
                  distance={20}
                  title="Load premade emails or emails and passwords in the format email or email:pass"
                >
                  <FontAwesomeIcon icon="question-circle" />
                </Tooltip>
                <Button onClick={this.loadEmails}>Load Emails & Passes</Button>
              </Col> */}
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
                  checked={sameDeliveryBillingBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>One Checkout</Label>
                <CustomInput
                  type="switch"
                  id="oneCheckoutBool"
                  name="oneCheckoutBool"
                  checked={oneCheckoutBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Name</Label>
                <CustomInput
                  type="switch"
                  id="randomNameBool"
                  name="randomNameBool"
                  checked={randomNameBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Phone Number</Label>
                <CustomInput
                  type="switch"
                  id="randomPhoneNumberBool"
                  name="randomPhoneNumberBool"
                  checked={randomPhoneNumberBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Use Catchall</Label>
                <CustomInput
                  type="switch"
                  id="useCatchallBool"
                  name="useCatchallBool"
                  checked={useCatchallBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Jig Addresses</Label>
                <CustomInput
                  type="switch"
                  id="jigAddressesBool"
                  name="jigAddressesBool"
                  checked={jigAddressesBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col xs="4" className="my-2">
                <Label>4 Char Prefix</Label>
                <CustomInput
                  type="switch"
                  id="fourCharPrefixBool"
                  name="fourCharPrefixBool"
                  checked={fourCharPrefixBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
            </Row>
            <Row className="my-4">
              <Col>
                <Button onClick={this.saveProfile}>Save Profile</Button>
              </Col>
              <Col>
                <Button color="danger" onClick={this.clearProfile}>
                  Clear Profile
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100">
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
            <Row className="py-3 align-items-end noselect panel-middle">
              <Col>
                <Button onClick={this.addCards}>Add Cards</Button>
              </Col>
              <Col>
                <Button color="danger" onClick={clearCards}>
                  Clear Cards
                </Button>
              </Col>
            </Row>
            <Row className="py-3 align-items-end noselect">
              <Col>
                <Label>
                  Qty{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="If you want to create profiles without using cards, simply enter the number of profiles you want here."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  id="profileQty"
                  name="profileQty"
                  onChange={this.handleChange}
                  value={profileQty}
                />
              </Col>
              <Col>
                <Input
                  type="select"
                  id="bot"
                  name="bot"
                  onChange={this.handleChange}
                  value={bot}
                >
                  <option key={generateUEID()} value="">
                    Select a bot
                  </option>
                  {bots.sort().map(botOption => (
                    <option key={generateUEID()} value={botOption}>
                      {botOption}
                    </option>
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
  }).isRequired,
  profile: PropTypes.shape({
    randomNameBool: PropTypes.bool.isRequired,
    randomPhoneNumberBool: PropTypes.bool.isRequired,
    useCatchallBool: PropTypes.bool.isRequired,
    deliveryAddress: PropTypes.string.isRequired,
    deliveryFirstName: PropTypes.string.isRequired,
    deliveryLastName: PropTypes.string.isRequired,
    deliveryCity: PropTypes.string.isRequired,
    deliveryApt: PropTypes.string.isRequired,
    deliveryCountry: PropTypes.string.isRequired,
    deliveryRegion: PropTypes.string.isRequired,
    deliveryZip: PropTypes.string.isRequired,
    billingAddress: PropTypes.string.isRequired,
    billingFirstName: PropTypes.string.isRequired,
    billingLastName: PropTypes.string.isRequired,
    billingCity: PropTypes.string.isRequired,
    billingApt: PropTypes.string.isRequired,
    billingCountry: PropTypes.string.isRequired,
    billingRegion: PropTypes.string.isRequired,
    billingZip: PropTypes.string.isRequired
  }).isRequired,
  clearProfileAttributes: PropTypes.func.isRequired,
  updateProfileAttribute: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  addCards: PropTypes.func.isRequired,
  clearCards: PropTypes.func.isRequired,
  cards: PropTypes.arrayOf(PropTypes.any).isRequired
};

export default withToastManager(ProfileCreator);
