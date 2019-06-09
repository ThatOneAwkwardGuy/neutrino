import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup } from 'reactstrap';
import Toggle from 'react-toggle';
import { CSSTransition } from 'react-transition-group';
import Countries from '../store/countries';
import FontAwesome from 'react-fontawesome';
const fs = require('fs');
const converter = require('json-2-csv');
const { dialog } = require('electron').remote;
const randomName = require('random-name');
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
const bots = ['Cybersole', 'Project Destroyer', 'Ghost', 'EVE AIO', 'Phantom', 'Dashe', 'Hastey', 'Kodai', 'NSB', 'SOLE AIO', 'Neutrino Raffle', 'CSV'];
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
        paymentCVV: '',
        catchallEmail: '',
        randomPhoneNumberTemplate: '',
        sameAsDelivery: false,
        oneCheckout: false,
        randomName: false,
        randomPhoneNumber: false,
        useCatchallEmail: false
      },
      cardNumber: '',
      cardType: cardTypes[0],
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCVV: '',
      botType: bots[0],
      massCards: '',
      massCardModal: false,
      profileModal: false,
      regionArrayShipping: [],
      regionArrayBilling: [],
      cards: [],
      jigAddresses: true,
      fourCharPrefix: false,
      nsbProfileAmount: 0
    };
  }

  handleChange = e => {
    console.log(e.target.value);
    this.setState({ [e.target.name]: e.target.value });
  };

  addCard = (cardNumber, cardType, cardExpiryMonth, cardExpiryYear, cardCVV) => {
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
    console.log(jigs);
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

  toggleButton = e => {
    this.setState({
      [e.target.name]: !this.state[e.target.name]
    });
  };

  toggleFormDataButton = e => {
    this.setState({
      formdata: { ...this.state.formdata, [e.target.name]: !this.state.formdata[e.target.name] }
    });
  };

  capitalize = s => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
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

  string_chop = (str, size) => {
    if (str == null) return [];
    str = String(str);
    size = ~~size;
    return size > 0 ? str.match(new RegExp('.{1,' + size + '}', 'g')) : [str];
  };

  makeid = length => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  };

  getCardType = number => {
    var re = new RegExp('^4');
    if (number.match(re) != null) return 'visa';
    if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number)) return 'master';
    re = new RegExp('^3[47]');
    if (number.match(re) != null) return 'american_express';
    re = new RegExp('^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)');
    return '';
  };

  getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  exportAddressesAndCards = async () => {
    const addressString = `${this.state.fourCharPrefix ? this.makeid(4).toUpperCase() + ' ' : ''}${this.state.formdata.deliveryAddress} | ${
      this.state.formdata.deliveryAptorSuite
    } | ${this.state.formdata.deliveryCity} | ${this.state.formdata.deliveryProvince} | ${this.state.formdata.deliveryZip} | ${
      this.state.formdata.deliveryCountry
    }`;
    console.log(addressString);
    const jigsSet = this.state.jigAddresses ? Array.from(this.jigAddress(addressString)) : Array(this.state.cards.length).fill(addressString);
    const profiles = {};
    let jiggedAddress;
    if (jigsSet.length <= this.state.cards.length) {
      jiggedAddress = jigsSet;
    } else {
      jiggedAddress = jigsSet.slice(0, this.state.cards.length);
    }
    jiggedAddress.forEach((address, index) => {
      const [deliveryAddress, deliveryAptorSuite, deliveryCity, deliveryProvince, deliveryZip, deliveryCountry] = address
        .replace('\n', ' ')
        .split(' | ')
        .map(element => element.trim());
      const randomFirstName = randomName.first();
      const randomLastName = randomName.last();
      switch (this.state.botType) {
        case 'Cybersole':
          profiles[`Profile - ${index}`] = {
            name: `Profile - ${index}`,
            payment: {
              email: this.state.formdata.useCatchallEmail
                ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
                : this.state.formdata.paymentEmail,
              phone: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber,
              card: {
                name: `${this.state.formdata.deliveryFirstName} ${this.state.formdata.deliveryLastName}`,
                number: this.state.cards[index].cardNumber.match(/.{1,4}/g).join(' '),
                exp_month: this.state.cards[index].cardExpiryMonth,
                exp_year: this.state.cards[index].cardExpiryYear,
                cvv: this.state.cards[index].cardCVV
              }
            },
            delivery: {
              first_name: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              last_name: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              addr1: deliveryAddress,
              addr2: deliveryAptorSuite,
              zip: deliveryZip,
              city: deliveryCity,
              country: deliveryCountry,
              state: deliveryProvince,
              same_as_del: this.state.formdata.sameAsDelivery
            },
            billing: {
              first_name: this.state.formdata.billingFirstName,
              last_name: this.state.formdata.billingLastName,
              addr1: this.state.formdata.billingAddress,
              addr2: this.state.formdata.billingAptorSuite,
              zip: this.state.formdata.billingZip,
              city: this.state.formdata.billingCity,
              country: this.state.formdata.billingCountry,
              state: this.state.formdata.billingProvince,
              same_as_del: this.state.formdata.sameAsDelivery
            },
            one_checkout: this.state.formdata.oneCheckout,
            favourite: false
          };
          break;
        case 'Project Destroyer':
          profiles[`Profile - ${index}`] = {
            billing: {
              address1: this.state.formdata.billingAddress,
              address2: this.state.formdata.billingAptorSuite,
              city: this.state.formdata.billingCity,
              country: this.state.formdata.billingCountry,
              firstName: this.state.formdata.billingFirstName,
              lastName: this.state.formdata.billingLastName,
              phone: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber,
              state: this.state.formdata.billingProvince,
              zipcode: this.state.formdata.billingZip
            },
            card: {
              code: this.state.cards[index].cardCVV,
              expire: this.state.cards[index].cardExpiryMonth + ' / ' + this.state.cards[index].cardExpiryYear,
              name: `${this.state.formdata.deliveryFirstName} ${this.state.formdata.deliveryLastName}`,
              number: this.state.cards[index].cardNumber
            },
            email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            id: Math.random()
              .toString(36)
              .substring(2, 10),
            limit: this.state.formdata.oneCheckout,
            match: this.state.formdata.sameAsDelivery,
            shipping: {
              address1: deliveryAddress,
              address2: deliveryAptorSuite,
              city: deliveryCity,
              country: deliveryCountry,
              firstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              lastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              phone: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber,
              state: deliveryProvince,
              zipcode: deliveryZip
            },
            title: `Profile - ${index}`
          };
          break;
        case 'Ghost':
          profiles[`Profile - ${index}`] = {
            CCNumber: this.state.cards[index].cardNumber,
            CVV: this.state.cards[index].cardCVV,
            ExpMonth: this.state.cards[index].cardExpiryMonth,
            ExpYear: this.state.cards[index].cardExpiryYear,
            CardType: this.getCardType(this.state.cards[index].cardNumber),
            Same: this.state.formdata.sameAsDelivery,
            Shipping: {
              FirstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              LastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              Address: deliveryAddress,
              Apt: deliveryAptorSuite,
              City: deliveryCity,
              State: deliveryProvince,
              Zip: deliveryZip
            },
            Billing: {
              FirstName: this.state.formdata.billingFirstName,
              LastName: this.state.formdata.billingLastName,
              Address: this.state.formdata.billingAddress,
              Apt: this.state.formdata.billingAptorSuite,
              City: this.state.formdata.billingCity,
              State: this.state.formdata.billingProvince,
              Zip: this.state.formdata.billingZip
            },
            Phone: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            Name: `Profile - ${index}`,
            Country: deliveryCountry
          };
          break;
        case 'EVE AIO':
          profiles[`Profile - ${index}`] = {
            ProfileName: `Profile - ${index}`,
            BillingFirstName: this.state.formdata.billingFirstName,
            BillingLastName: this.state.formdata.billingLastName,
            BillingAddressLine1: this.state.formdata.billingAddress,
            BillingAddressLine2: this.state.formdata.billingAptorSuite,
            BillingCity: this.state.formdata.billingCity,
            BillingState: this.state.formdata.billingProvince,
            BillingCountryCode: Countries[this.state.formdata.deliveryCountry].code,
            BillingZip: this.state.formdata.billingZip,
            BillingPhone: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            BillingEmail: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            ShippingFirstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
            ShippingLastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
            ShippingAddressLine1: deliveryAddress,
            ShippingAddressLine2: deliveryAptorSuite,
            ShippingCity: deliveryCity,
            ShippingState: deliveryProvince,
            ShippingCountryCode: deliveryCountry,
            ShippingZip: deliveryZip,
            ShippingPhone: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            ShippingEmail: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            NameOnCard: this.state.formdata.billingFirstName + ' ' + this.state.formdata.billingLastName,
            CreditCardNumber: this.state.cards[index].cardNumber,
            ExpirationMonth: this.state.cards[index].cardExpiryMonth,
            ExpirationYear: this.state.cards[index].cardExpiryYear,
            Cvv: this.state.cards[index].cardCVV,
            CardType: this.getCardType(this.state.cards[index].cardNumber),
            OneCheckoutPerWebsite: this.state.formdata.oneCheckout,
            SameBillingShipping: this.state.formdata.sameAsDelivery,
            BirthDay: '',
            BirthMonth: '',
            BirthYear: ''
          };
          break;
        case 'Phantom':
          profiles[`Profile - ${index}`] = {
            Billing: {
              Address: this.state.formdata.billingAddress,
              Apt: this.state.formdata.billingAptorSuite,
              City: this.state.formdata.billingCity,
              FirstName: this.state.formdata.billingFirstName,
              LastName: this.state.formdata.billingLastName,
              State: this.state.formdata.billingProvince,
              Zipcode: this.state.formdata.billingZip
            },
            CCNumber: this.state.cards[index].cardNumber,
            CVV: this.state.cards[index].cardCVV,
            CardType: this.getCardType(this.state.cards[index].cardNumber),
            Country: deliveryCountry,
            Email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            ExpMonth: this.state.cards[index].cardExpiryMonth,
            ExpYear: this.state.cards[index].cardExpiryYear,
            Name: `Profile - ${index}`,
            Phone: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            Same: this.state.formdata.sameAsDelivery,
            Shipping: {
              Address: deliveryAddress,
              Apt: deliveryAptorSuite,
              City: deliveryCity,
              FirstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              LastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              State: deliveryProvince,
              Zipcode: deliveryZip
            }
          };
          break;
        case 'Dashe':
          profiles[`Profile - ${index}`] = {
            billing: {
              address1: this.state.formdata.billingAddress,
              address2: this.state.formdata.billingAptorSuite,
              city: this.state.formdata.billingCity,
              country: this.state.formdata.billingCountry,
              firstName: this.state.formdata.billingFirstName,
              lastName: this.state.formdata.billingLastName,
              phone: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber,
              state: this.state.formdata.billingProvince,
              zipcode: this.state.formdata.billingZip
            },
            billingMatch: this.state.formdata.sameAsDelivery,
            card: {
              cvv: this.state.cards[index].cardCVV,
              holder: this.state.formdata.deliveryFirstName + ' ' + this.state.formdata.deliveryLastName,
              month: this.state.cards[index].cardExpiryMonth,
              number: this.state.cards[index].cardNumber,
              year: this.state.cards[index].cardExpiryYear
            },
            email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            profileName: `Profile - ${index}`,
            shipping: {
              address: deliveryAddress,
              apt: deliveryAptorSuite,
              city: deliveryCity,
              country: deliveryCountry,
              firstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              lastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              phoneNumber: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber,
              state: deliveryProvince,
              zipCode: deliveryZip
            }
          };
          break;
        case 'Hastey':
          profiles[`Profile - ${index}`] = {
            __profile__name: `Profile - ${index}`,
            address: deliveryAddress,
            address_2: deliveryAptorSuite,
            cardType: this.getCardType(this.state.cards[index].cardNumber),
            cc_cvv: this.state.cards[index].cardCVV,
            cc_month: this.state.cards[index].cardExpiryMonth,
            cc_number: this.state.cards[index].cardNumber,
            cc_year: this.state.cards[index].cardExpiryYear,
            city: this.state.formdata.deliveryCity,
            country: this.state.formdata.deliveryCountry,
            email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            id:
              Math.random()
                .toString(36)
                .substring(2, 10) +
              '-' +
              Math.random()
                .toString(36)
                .substring(2, 6) +
              '-' +
              Math.random()
                .toString(36)
                .substring(2, 6) +
              '-' +
              Math.random()
                .toString(36)
                .substring(2, 6) +
              '-' +
              Math.random()
                .toString(36)
                .substring(2, 14),
            name: `${this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName} ${
              this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName
            }`,
            state: this.state.formdata.deliveryProvince,
            tel: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            zip: this.state.formdata.deliveryZip
          };
        case 'Kodai':
          profiles[`Profile - ${index}`] = {
            Dummy: {
              billingAddress: {
                address: this.state.formdata.billingAddress,
                apt: this.state.formdata.billingAptorSuite,
                city: this.state.formdata.billingCity,
                firstName: this.state.formdata.billingFirstName,
                lastName: this.state.formdata.billingLastName,
                phoneNumber: this.state.formdata.randomPhoneNumber
                  ? this.state.formdata.randomPhoneNumberTemplate
                      .split('#')
                      .map(number => {
                        return number === '' ? this.getRandomInt(9) : number;
                      })
                      .join('')
                  : this.state.formdata.phoneNumber,
                state: this.state.formdata.billingProvince,
                zipCode: this.state.formdata.billingZip
              },
              deliveryAddress: {
                address: this.state.formdata.deliveryAddress,
                apt: this.state.formdata.deliveryAptorSuite,
                city: this.state.formdata.deliveryCity,
                firstName: this.state.formdata.deliveryFirstName,
                lastName: this.state.formdata.deliveryLastName,
                phoneNumber: this.state.formdata.randomPhoneNumber
                  ? this.state.formdata.randomPhoneNumberTemplate
                      .split('#')
                      .map(number => {
                        return number === '' ? this.getRandomInt(9) : number;
                      })
                      .join('')
                  : this.state.formdata.phoneNumber,
                state: this.state.formdata.deliveryProvince,
                zipCode: this.state.formdata.deliveryZip
              },
              miscellaneousInformation: { deliverySameAsBilling: this.state.formdata.sameAsDelivery },
              paymentDetails: {
                cardHolder: this.state.formdata.deliveryFirstName + ' ' + this.state.formdata.deliveryLastName,
                cardNumber: this.state.cards[index].cardExpiryMonth,
                cvv: this.state.cards[index].cardCVV,
                emailAddress: this.state.formdata.paymentEmail,
                expirationDate: `${this.state.cards[index].cardExpiryMonth}/${this.state.cards[index].cardExpiryYear.slice(-2)}`
              },
              profileName: `Profile - ${index}`,
              region: this.state.formdata.deliveryCountry
            }
          };
          break;
        case 'Neutrino Raffle':
          profiles[`Profile - ${index}`] = {
            email: this.state.formdata.paymentEmail,
            firstName: this.state.formdata.billingFirstName,
            lastName: this.state.formdata.billingLastName,
            phoneNumber: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            address: {
              address: this.state.formdata.billingAddress,
              apt: this.state.formdata.billingAptorSuite,
              city: this.state.formdata.billingCity,
              state: this.state.formdata.billingProvince,
              zipCode: this.state.formdata.billingZip,
              region: this.state.formdata.deliveryCountry
            },
            paymentDetails: {
              cardHolder: this.state.formdata.deliveryFirstName + ' ' + this.state.formdata.deliveryLastName,
              cardNumber: this.state.cards[index].cardExpiryMonth,
              cvv: this.state.cards[index].cardCVV,
              emailAddress: this.state.formdata.paymentEmail,
              expirationDate: `${this.state.cards[index].cardExpiryMonth}/${this.state.cards[index].cardExpiryYear.slice(-2)}`
            }
          };
          break;
        case 'CSV':
          profiles[`Profile - ${index}`] = {
            profileID: `Profile - ${index}`,
            deliveryCountry: deliveryCountry,
            deliveryAddress: deliveryAddress,
            deliveryCity: deliveryCity,
            deliveryFirstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
            deliveryLastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
            deliveryProvince: deliveryProvince,
            deliveryZip: deliveryZip,
            deliveryAptorSuite: deliveryAptorSuite,
            billingZip: this.state.formdata.billingZip,
            billingCountry: this.state.formdata.billingCountry,
            billingAddress: this.state.formdata.billingAddress,
            billingCity: this.state.formdata.billingCity,
            billingFirstName: this.state.formdata.billingFirstName,
            billingLastName: this.state.formdata.billingLastName,
            billingProvince: this.state.formdata.billingProvince,
            billingAptorSuite: this.state.formdata.billingAptorSuite,
            phoneNumber: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            paymentEmail: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            paymentCardholdersName: this.state.formdata.paymentCardholdersName,
            paymentCardnumber: this.state.cards[index].cardNumber,
            paymentCardExpiryMonth: this.state.cards[index].cardExpiryMonth,
            paymentCardExpiryYear: this.state.cards[index].cardExpiryYear,
            paymentCVV: this.state.cards[index].cardCVV
          };
          break;
        case 'NSB':
          profiles[`Profile - ${index}`] = {
            shipping: {
              firstname: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
              lastname: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
              country: Countries[this.state.formdata.deliveryCountry].code,
              city: deliveryCity,
              address: deliveryAddress,
              address2: deliveryAptorSuite,
              state:
                Countries[this.state.formdata.deliveryCountry].province_codes[deliveryCity] !== undefined
                  ? Countries[this.state.formdata.deliveryCountry].province_codes[deliveryCity]
                  : '',
              zip: deliveryZip,
              phone: this.state.formdata.randomPhoneNumber
                ? this.state.formdata.randomPhoneNumberTemplate
                    .split('#')
                    .map(number => {
                      return number === '' ? this.getRandomInt(9) : number;
                    })
                    .join('')
                : this.state.formdata.phoneNumber
            },
            name: `Profile - ${index}`,
            cc: {
              number: this.state.cards[index].cardNumber.match(/.{1,4}/g).join(' '),
              expiry: `${this.state.cards[index].cardExpiryMonth} / ${this.state.cards[index].cardExpiryYear.slice(-2)}`,
              cvc: this.state.cards[index].cardCVV,
              name: `${this.state.formdata.billingFirstName} ${this.state.formdata.billingLastName}`
            },
            email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            checkoutLimit: 0,
            billingSame: this.state.formdata.sameAsDelivery,
            date: +new Date(),
            id: parseInt(this.state.nsbProfileAmount) + index
          };
          break;
        case 'SOLE AIO':
          profiles[`Profile - ${index}`] = {
            ID: index,
            ProfileName: `Profile - ${index}`,
            Email: this.state.formdata.useCatchallEmail
              ? `${randomFirstName}${randomLastName}@${this.state.formdata.catchallEmail}`
              : this.state.formdata.paymentEmail,
            Phone: this.state.formdata.randomPhoneNumber
              ? this.state.formdata.randomPhoneNumberTemplate
                  .split('#')
                  .map(number => {
                    return number === '' ? this.getRandomInt(9) : number;
                  })
                  .join('')
              : this.state.formdata.phoneNumber,
            ShippingFirstName: this.state.formdata.randomName ? randomFirstName : this.state.formdata.deliveryFirstName,
            ShippingLastName: this.state.formdata.randomName ? randomLastName : this.state.formdata.deliveryLastName,
            ShippingAddress1: deliveryAddress,
            ShippingAddress2: deliveryAptorSuite,
            ShippingCity: deliveryCity,
            ShippingZip: deliveryZip,
            ShippingCountry: this.state.formdata.deliveryCountry,
            ShippingState:
              Countries[this.state.formdata.deliveryCountry].province_codes[deliveryProvince] !== undefined
                ? Countries[this.state.formdata.deliveryCountry].province_codes[deliveryProvince]
                : '',
            UseBilling: !this.state.formdata.sameAsDelivery,
            BillingFirstName: this.state.formdata.billingFirstName,
            BillingLastName: this.state.formdata.billingLastName,
            BillingAddress1: this.state.formdata.billingAddress,
            BillingAddress2: this.state.formdata.billingAptorSuite,
            BillingCity: this.state.formdata.billingCity,
            BillingZip: this.state.formdata.billingZip,
            BillingCountry: this.state.formdata.billingCountry,
            BillingState:
              Countries[this.state.formdata.deliveryCountry].province_codes[this.state.formdata.billingProvince] !== undefined
                ? Countries[this.state.formdata.deliveryCountry].province_codes[this.state.formdata.billingProvince]
                : '',
            CardNumber: this.state.cards[index].cardNumber,
            CardName: `${this.state.formdata.billingFirstName} ${this.state.formdata.billingLastName}`,
            CardCvv: this.state.cards[index].cardCVV,
            CardExpiryMonth: this.state.cards[index].cardExpiryMonth,
            CardExpiryYear: this.state.cards[index].cardExpiryYear.slice(-2),
            CardType: this.capitalize(this.getCardType(this.state.cards[index].cardNumber)),
            CheckoutLimit: 'No checkout limit'
          };
          break;
        default:
          break;
      }
    });
    const name = `${this.state.botType} - Profiles`;
    const extension = this.returnFileExtension(this.state.botType);
    let file;
    if (this.state.botType === 'CSV') {
      console.log(profiles);
      file = await converter.json2csvAsync(this.convertProfiles(profiles));
    } else {
      file = JSON.stringify(this.convertProfiles(profiles));
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
          if (err) {
            // this.setState({
            //   profileExportFailure: true
            // });
            return;
          }
          // this.setState({
          //   profileExportSuccess: true
          // });
        });
      }
    );
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
    if (['Project Destroyer', 'Hastey', 'EVE AIO', 'Phantom', 'CSV', 'NSB', 'SOLE AIO'].includes(this.state.botType)) {
      return Object.values(profiles);
    } else {
      return profiles;
    }
  };

  saveProfile = () => {
    const profile = { ...this.state.formdata, profileID: 'ProfileGeneratorProfile' };
    this.props.onAddProfile(profile);
    this.toggleProfileModal();
  };

  componentDidMount() {
    if (this.props.profiles.profiles.ProfileGeneratorProfile) {
      this.setState({ formdata: this.props.profiles.profiles.ProfileGeneratorProfile }, () => {
        this.setRegionArrayShipping(this.state.formdata.deliveryCountry);
        this.setRegionArrayBilling(this.state.formdata.billingCountry);
      });
    }
  }

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
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
          <Row className="my-3">
            <Col xs="2">
              <Label>bot</Label>
              <Input type="select" name="botType" onChange={this.handleChange}>
                {bots.map(this.returnOption)}
              </Input>
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
            {this.state.botType === 'NSB' ? (
              <Col xs="2">
                <Label>NSB Profile No.</Label>
                <Input type="number" name="nsbProfileAmount" onChange={this.handleChange} value={this.state.nsbProfileAmount} />
              </Col>
            ) : null}
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
              <Row>
                {!this.state.formdata.useCatchallEmail ? (
                  <Col>
                    <Label for="store">payment email</Label>
                    <Input
                      type="text"
                      name="paymentEmail"
                      id="paymentEmail"
                      value={this.state.formdata.paymentEmail}
                      onChange={this.handleChangeShippingOrBilling}
                    />
                  </Col>
                ) : (
                  <Col>
                    <Label for="store">catchall email</Label>
                    <Input
                      type="text"
                      name="catchallEmail"
                      id="catchallEmail"
                      placeholder="example.com"
                      value={this.state.formdata.catchallEmail}
                      onChange={this.handleChangeShippingOrBilling}
                    />
                  </Col>
                )}

                {!this.state.formdata.randomPhoneNumber ? (
                  <Col>
                    <Label for="store">phone number</Label>
                    <Input
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={this.state.formdata.phoneNumber}
                      onChange={this.handleChangeShippingOrBilling}
                    />
                  </Col>
                ) : (
                  <Col>
                    <Label for="store">phone number template</Label>
                    <Input
                      type="text"
                      name="randomPhoneNumberTemplate"
                      id="randomPhoneNumberTemplate"
                      placeholder="+44######### #->random number"
                      value={this.state.formdata.randomPhoneNumberTemplate}
                      onChange={this.handleChangeShippingOrBilling}
                    />
                  </Col>
                )}
              </Row>
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
                          onChange={this.handleChangeShippingOrBilling}
                        />
                      </Col>
                      <Col xs="6">
                        <Label for="store">last name</Label>
                        <Input
                          type="text"
                          name="deliveryLastName"
                          id="deliveryLastName"
                          value={this.state.formdata.deliveryLastName}
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
                        />
                      </Col>
                      <Col xs="3">
                        <Label for="store">apt,suite</Label>
                        <Input
                          type="text"
                          name="deliveryAptorSuite"
                          id="deliveryAptorSuite"
                          value={this.state.formdata.deliveryAptorSuite}
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
                        >
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
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
                        />
                      </Col>
                      <Col xs="6">
                        <Label for="store">last name</Label>
                        <Input
                          type="text"
                          name="billingLastName"
                          id="billingLastName"
                          value={this.state.formdata.billingLastName}
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
                        />
                      </Col>
                      <Col xs="3">
                        <Label for="store">apt,suite</Label>
                        <Input
                          type="text"
                          name="billingAptorSuite"
                          id="billingAptorSuite"
                          value={this.state.formdata.billingAptorSuite}
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
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
                          onChange={this.handleChangeShippingOrBilling}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col xs="12">
                        <Label for="store">
                          <Button onClick={this.setDeliveryToBilling}>copy delivery</Button>
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
              <FormGroup row>
                <Col xs="4" className="text-center">
                  <Label for="store">Same Delivery/Billing</Label>
                  <Toggle name="sameAsDelivery" checked={this.state.formdata.sameAsDelivery} onChange={this.toggleFormDataButton} />
                </Col>
                <Col xs="4" className="text-center">
                  <Label for="store">One Checkout</Label>
                  <Toggle name="oneCheckout" checked={this.state.formdata.oneCheckout} onChange={this.toggleFormDataButton} />
                </Col>
                <Col xs="4" className="text-center">
                  <Label for="store">Random Name</Label>
                  <Toggle name="randomName" checked={this.state.formdata.randomName} onChange={this.toggleFormDataButton} />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col xs="6" className="text-center">
                  <Label for="store">Random Phone Number</Label>
                  <Toggle name="randomPhoneNumber" checked={this.state.formdata.randomPhoneNumber} onChange={this.toggleFormDataButton} />
                </Col>
                <Col xs="6" className="text-center">
                  <Label for="store">Use Catchall Email</Label>
                  <Toggle name="useCatchallEmail" checked={this.state.formdata.useCatchallEmail} onChange={this.toggleFormDataButton} />
                </Col>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button className="nButton" onClick={this.saveProfile}>
                Save
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </CSSTransition>
    );
  }
}
