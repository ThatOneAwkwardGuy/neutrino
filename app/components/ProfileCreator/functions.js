import Countries from '../../constants/countries';
import {
  tksCardMappings,
  longToShortCountries
} from '../../constants/constants';

const uuidv4 = require('uuid/v4');
const randomName = require('random-name');

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const getCardType = number => {
  let re = new RegExp('^4');
  if (number.match(re) != null) return 'visa';
  if (
    /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(
      number
    )
  )
    return 'master';
  re = new RegExp('^3[47]');
  if (number.match(re) != null) return 'american_express';
  re = new RegExp(
    '^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)'
  );
  return '';
};

const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const convertBaseToCybersole = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  name: `Profile - ${index}`,
  payment: {
    email: baseProfile.useCatchallBool
      ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
      : baseProfile.email,
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone,
    card: {
      name: `${baseProfile.deliveryFirstName} ${baseProfile.deliveryLastName}`,
      number: card.cardNumber.match(/.{1,4}/g).join(' '),
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvv: card.cvv
    }
  },
  delivery: {
    first_name: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    last_name: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    addr1: baseProfile.deliveryAddress,
    addr2: baseProfile.deliveryApt,
    zip: baseProfile.deliveryZip,
    city: baseProfile.deliveryCity,
    country: baseProfile.deliveryCountry,
    state: baseProfile.deliveryRegion,
    same_as_del: baseProfile.sameDeliveryBillingBool
  },
  billing: {
    first_name: baseProfile.billingFirstName,
    last_name: baseProfile.billingLastName,
    addr1: baseProfile.billingAddress,
    addr2: baseProfile.billingApt,
    zip: baseProfile.billingZip,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    state: baseProfile.billingRegion,
    same_as_del: baseProfile.sameDeliveryBillingBool
  },
  one_checkout: baseProfile.oneCheckoutBool,
  favourite: false
});

export const convertBaseToProjectDestroyer = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  billing: {
    address1: baseProfile.billingAddress,
    address2: baseProfile.billingApt,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone,
    state: baseProfile.billingRegion,
    zipcode: baseProfile.billingZip
  },
  card: {
    code: card.cvv,
    expire: `${card.expMonth} / ${card.expYear}`,
    name: `${baseProfile.deliveryFirstName} ${baseProfile.deliveryLastName}`,
    number: card.cardNumber
  },
  email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  id: Math.random()
    .toString(36)
    .substring(2, 10),
  limit: baseProfile.oneCheckoutBool,
  match: baseProfile.sameDeliveryBillingBool,
  shipping: {
    address1: baseProfile.deliveryAddress,
    address2: baseProfile.deliveryApt,
    city: baseProfile.deliveryCity,
    country: baseProfile.deliveryCountry,
    firstName: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastName: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone,
    state: baseProfile.deliveryRegion,
    zipcode: baseProfile.deliveryZip
  },
  title: `Profile - ${index}`
});

export const convertBaseToBalko = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  id: `Profile - ${index}`,
  firstname: baseProfile.randomName
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  lastname: baseProfile.randomName
    ? randomLastName
    : baseProfile.deliveryLastName,
  email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  phone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  add1: baseProfile.deliveryAddress,
  add2: baseProfile.deliveryApt,
  state: baseProfile.deliveryRegion,
  zip: baseProfile.deliveryZip,
  country: baseProfile.deliveryCountry,
  city: baseProfile.deliveryCity,
  ccfirst: baseProfile.billingFirstName,
  cclast: baseProfile.billingLastName,
  cc: card.cardNumber,
  expm: card.expMonth,
  expy: card.expYear,
  ccv: card.cvv,
  oneCheckout: baseProfile.oneCheckoutBool,
  bfirstname: baseProfile.billingFirstName,
  blastname: baseProfile.billingLastName,
  badd1: baseProfile.billingAddress,
  badd2: baseProfile.billingApt,
  bstate: baseProfile.billingRegion,
  bzip: baseProfile.billingZip,
  bcountry: baseProfile.billingCountry,
  bcity: baseProfile.billingCity
});

export const convertBaseToEVEAIO = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  ProfileName: `Profile - ${index}`,
  BillingFirstName: baseProfile.billingFirstName,
  BillingLastName: baseProfile.billingLastName,
  BillingAddressLine1: baseProfile.billingAddress,
  BillingAddressLine2: baseProfile.billingApt,
  BillingCity: baseProfile.billingCity,
  BillingState: baseProfile.billingRegion,
  BillingCountryCode:
    Countries[baseProfile.billingCountry] !== undefined
      ? Countries[baseProfile.billingCountry].code
      : '',
  BillingZip: baseProfile.billingZip,
  Billingphone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  BillingEmail: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  ShippingFirstName: baseProfile.randomName
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  ShippingLastName: baseProfile.randomName
    ? randomLastName
    : baseProfile.deliveryLastName,
  ShippingAddressLine1: baseProfile.deliveryAddress,
  ShippingAddressLine2: baseProfile.deliveryApt,
  ShippingCity: baseProfile.deliveryCity,
  ShippingState: baseProfile.deliveryRegion,
  ShippingCountryCode:
    Countries[baseProfile.deliveryCountry] !== undefined
      ? Countries[baseProfile.deliveryCountry].code
      : '',
  ShippingZip: baseProfile.deliveryZip,
  Shippingphone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  ShippingEmail: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  NameOnCard: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
  CreditCardNumber: card.cardNumber,
  ExpirationMonth: card.expMonth,
  ExpirationYear: card.expYear,
  Cvv: card.cvv,
  CardType: getCardType(card.cardNumber),
  OneCheckoutPerWebsite: baseProfile.oneCheckoutBool,
  SameBillingShipping: baseProfile.sameDeliveryBillingBool,
  BirthDay: '',
  BirthMonth: '',
  BirthYear: ''
});

export const convertBaseToPhantom = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  Billing: {
    Address: baseProfile.billingAddress,
    Apt: baseProfile.billingApt,
    City: baseProfile.billingCity,
    FirstName: baseProfile.billingFirstName,
    LastName: baseProfile.billingLastName,
    State:
      Countries[baseProfile.billingCountry].province_codes[
        baseProfile.billingRegion
      ] !== undefined
        ? Countries[baseProfile.billingCountry].province_codes[
            baseProfile.billingRegion
          ]
        : '',
    Zip: baseProfile.billingZip
  },
  CCNumber: card.cardNumber,
  CVV: card.cvv,
  CardType: getCardType(card.cardNumber),
  Country:
    longToShortCountries[baseProfile.deliveryCountry] !== undefined
      ? longToShortCountries[baseProfile.deliveryCountry]
      : '',
  Email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  ExpMonth: card.expMonth,
  ExpYear: card.expYear,
  Name: `Profile - ${index}`,
  Phone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  Same: baseProfile.sameDeliveryBillingBool,
  Shipping: {
    Address: baseProfile.deliveryAddress,
    Apt: baseProfile.deliveryApt,
    City: baseProfile.deliveryCity,
    FirstName: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    LastName: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    State:
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    Zip: baseProfile.deliveryZip
  }
});

export const convertBaseToGhost = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  Billing: {
    Address: baseProfile.billingAddress,
    Apt: baseProfile.billingApt,
    City: baseProfile.billingCity,
    FirstName: baseProfile.billingFirstName,
    LastName: baseProfile.billingLastName,
    State:
      Countries[baseProfile.billingCountry].province_codes[
        baseProfile.billingRegion
      ] !== undefined
        ? Countries[baseProfile.billingCountry].province_codes[
            baseProfile.billingRegion
          ]
        : '',
    Zip: baseProfile.billingZip
  },
  CCNumber: card.cardNumber,
  CVV: card.cvv,
  CardType: getCardType(card.cardNumber),
  Country:
    longToShortCountries[baseProfile.deliveryCountry] !== undefined
      ? longToShortCountries[baseProfile.deliveryCountry]
      : '',
  Email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  ExpMonth: card.expMonth,
  ExpYear: card.expYear,
  Name: `Profile - ${index}`,
  Phone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  Same: baseProfile.sameDeliveryBillingBool,
  Shipping: {
    Address: baseProfile.deliveryAddress,
    Apt: baseProfile.deliveryApt,
    City: baseProfile.deliveryCity,
    FirstName: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    LastName: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    State:
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    Zip: baseProfile.deliveryZip
  }
});

export const convertBaseToDashe = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  billing: {
    address: baseProfile.billingAddress,
    apt: baseProfile.billingApt,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone,
    state: baseProfile.billingRegion,
    zipcode: baseProfile.billingZip
  },
  billingMatch: baseProfile.sameDeliveryBillingBool,
  card: {
    cvv: card.cvv,
    holder: `${baseProfile.deliveryFirstName} ${baseProfile.deliveryLastName}`,
    month: card.expMonth,
    number: card.cardNumber,
    year: card.expYear
  },
  email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  profileName: `Profile - ${index}`,
  shipping: {
    address: baseProfile.deliveryAddress,
    apt: baseProfile.deliveryApt,
    city: baseProfile.deliveryCity,
    country: baseProfile.deliveryCountry,
    firstName: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastName: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    phoneNumber: baseProfile.randomPhoneNumberBool
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
    state: baseProfile.deliveryRegion,
    zipCode: baseProfile.deliveryZip
  }
});

export const convertBaseToTKS = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  Id: uuidv4(),
  Name: `Profile - ${index}`,
  Billing: {
    Email: baseProfile.useCatchallBool
      ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
      : baseProfile.email,
    FirstName: baseProfile.billingFirstName,
    Lastname: baseProfile.billingLastName,
    AddressLine1: baseProfile.billingAddress,
    AddressLine2: null,
    Zip: baseProfile.billingZip,
    City: baseProfile.billingCity,
    CountryCode:
      Countries[baseProfile.billingCountry] !== undefined
        ? Countries[baseProfile.billingCountry].code
        : '',
    StateCode:
      Countries[baseProfile.billingCountry].province_codes[
        baseProfile.billingRegion
      ] !== undefined
        ? Countries[baseProfile.billingCountry].province_codes[
            baseProfile.billingRegion
          ]
        : '',
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  Shipping: {
    Pccc: null,
    Email: baseProfile.useCatchallBool
      ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
      : baseProfile.email,
    FirstName: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    Lastname: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    AddressLine1: baseProfile.deliveryAddress,
    AddressLine2: null,
    Zip: baseProfile.deliveryZip,
    City: baseProfile.deliveryCity,
    CountryCode:
      Countries[baseProfile.deliveryCountry] !== undefined
        ? Countries[baseProfile.deliveryCountry].code
        : '',
    StateCode:
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  Payment: {
    CardHolder: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
    CardNumber: card.cardNumber,
    ExpirationMonth: card.expMonth,
    ExpirationYear: card.expYear,
    SecurityCode: card.cvv,
    CardType: Object.keys(tksCardMappings).includes(
      getCardType(card.cardNumber)
    )
      ? tksCardMappings[getCardType(card.cardNumber)]
      : 0
  },
  Options: {
    UseBillingForShipping: baseProfile.sameDeliveryBillingBool,
    OneItemPerWebsite: baseProfile.oneCheckoutBool
  }
});

export const convertBaseToHastey = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  __profile__name: `Profile - ${index}`,
  address: baseProfile.deliveryAddress,
  address_2: baseProfile.deliveryApt,
  cardType: getCardType(card.cardNumber),
  cc_cvv: card.cvv,
  cc_month: card.expMonth,
  cc_number: card.cardNumber,
  cc_year: card.expYear,
  city: baseProfile.deliveryCity,
  country: baseProfile.deliveryCountry,
  email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  id: `${Math.random()
    .toString(36)
    .substring(2, 10)}-${Math.random()
    .toString(36)
    .substring(2, 6)}-${Math.random()
    .toString(36)
    .substring(2, 6)}-${Math.random()
    .toString(36)
    .substring(2, 6)}-${Math.random()
    .toString(36)
    .substring(2, 14)}`,
  name: `${
    baseProfile.randomName ? randomFirstName : baseProfile.deliveryFirstName
  } ${baseProfile.randomName ? randomLastName : baseProfile.deliveryLastName}`,
  state: baseProfile.deliveryRegion,
  tel: baseProfile.randomPhoneNumberBool
    ? baseProfile.randomPhoneNumberTemplate
        .split('#')
        .map(number => (number === '' ? getRandomInt(9) : number))
        .join('')
    : baseProfile.phone,
  zip: baseProfile.deliveryZip
});

export const convertBaseToKodai = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  billingAddress: {
    address: baseProfile.billingAddress,
    apt: baseProfile.billingApt,
    city: baseProfile.billingCity,
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    phoneNumber: baseProfile.randomPhoneNumberBool
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
    state: baseProfile.billingRegion,
    zipCode: baseProfile.billingZip
  },
  deliveryAddress: {
    address: baseProfile.deliveryAddress,
    apt: baseProfile.deliveryApt,
    city: baseProfile.deliveryCity,
    firstName: baseProfile.deliveryFirstName,
    lastName: baseProfile.deliveryLastName,
    phoneNumber: baseProfile.randomPhoneNumberBool
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
    state: baseProfile.deliveryRegion,
    zipCode: baseProfile.deliveryZip
  },
  miscellaneousInformation: {
    deliverySameAsBilling: baseProfile.sameDeliveryBillingBool
  },
  paymentDetails: {
    cardHolder: `${baseProfile.deliveryFirstName} ${baseProfile.deliveryLastName}`,
    cardNumber: card.cardNumber,
    cvv: card.cvv,
    emailAddress: baseProfile.useCatchallBool
      ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
      : baseProfile.email,
    expirationDate: `${card.expMonth}/${card.expYear.slice(-2)}`
  },
  profileName: `Profile - ${index}`,
  region: baseProfile.deliveryCountry
});

export const convertBaseToNSB = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  shipping: {
    firstname: baseProfile.randomName
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastname: baseProfile.randomName
      ? randomLastName
      : baseProfile.deliveryLastName,
    country:
      Countries[baseProfile.deliveryCountry] !== undefined
        ? Countries[baseProfile.deliveryCountry].code
        : '',
    city: baseProfile.deliveryCity,
    address: baseProfile.deliveryAddress,
    address2: baseProfile.deliveryApt,
    state:
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    zip: baseProfile.deliveryZip,
    phone:
      baseProfile.randomPhoneNumberBool &&
      baseProfile.randomPhoneNumberTemplate !== ''
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  name: `Profile - ${index}`,
  cc: {
    number: card.cardNumber.match(/.{1,4}/g).join(' '),
    expiry: `${card.expMonth} / ${card.expYear.slice(-2)}`,
    cvc: card.cvv,
    name: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`
  },
  email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  checkoutLimit: baseProfile.oneCheckoutBool ? 1 : 0,
  billingSame: baseProfile.sameDeliveryBillingBool,
  date: +new Date(),
  id: 10 + index
});

export const convertBaseToSOLEAIO = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  ID: index,
  ProfileName: `Profile - ${index}`,
  Email: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  phone:
    baseProfile.randomPhoneNumberBool &&
    baseProfile.randomPhoneNumberTemplate !== ''
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  ShippingFirstName: baseProfile.randomName
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  ShippingLastName: baseProfile.randomName
    ? randomLastName
    : baseProfile.deliveryLastName,
  ShippingAddress1: baseProfile.deliveryAddress,
  ShippingAddress2: baseProfile.deliveryApt,
  ShippingCity: baseProfile.deliveryCity,
  ShippingZip: baseProfile.deliveryZip,
  ShippingCountry: baseProfile.deliveryCountry,
  ShippingState:
    Countries[baseProfile.deliveryCountry].province_codes[
      baseProfile.deliveryRegion
    ] !== undefined
      ? Countries[baseProfile.deliveryCountry].province_codes[
          baseProfile.deliveryRegion
        ]
      : '',
  UseBilling: baseProfile.sameDeliveryBillingBool,
  BillingFirstName: baseProfile.billingFirstName,
  BillingLastName: baseProfile.billingLastName,
  BillingAddress1: baseProfile.billingAddress,
  BillingAddress2: baseProfile.billingApt,
  BillingCity: baseProfile.billingCity,
  BillingZip: baseProfile.billingZip,
  BillingCountry: baseProfile.billingCountry,
  BillingState:
    Countries[baseProfile.deliveryCountry].province_codes[
      baseProfile.billingRegion
    ] !== undefined
      ? Countries[baseProfile.deliveryCountry].province_codes[
          baseProfile.billingRegion
        ]
      : '',
  CardNumber: card.cardNumber,
  CardName: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
  cvv: card.cvv,
  expMonth: card.expMonth,
  expYear: card.expYear.slice(-2),
  CardType: capitalize(getCardType(card.cardNumber)),
  CheckoutLimit: baseProfile.oneCheckoutBool
    ? '1 checkout per site'
    : 'No checkout limit'
});

export const convertBaseToCSV = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  profileID: `Profile - ${index}`,
  deliveryCountry: baseProfile.deliveryCountry,
  deliveryAddress: baseProfile.deliveryAddress,
  deliveryCity: baseProfile.deliveryCity,
  deliveryFirstName: baseProfile.randomName
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  deliveryLastName: baseProfile.randomName
    ? randomLastName
    : baseProfile.deliveryLastName,
  deliveryRegion: baseProfile.deliveryRegion,
  deliveryZip: baseProfile.deliveryZip,
  deliveryApt: baseProfile.deliveryApt,
  billingZip: baseProfile.billingZip,
  billingCountry: baseProfile.billingCountry,
  billingAddress: baseProfile.billingAddress,
  billingCity: baseProfile.billingCity,
  billingFirstName: baseProfile.billingFirstName,
  billingLastName: baseProfile.billingLastName,
  billingRegion: baseProfile.billingRegion,
  billingApt: baseProfile.billingApt,
  phoneNumber: baseProfile.randomPhoneNumberBool
    ? baseProfile.randomPhoneNumberTemplate
        .split('#')
        .map(number => (number === '' ? getRandomInt(9) : number))
        .join('')
    : baseProfile.phone,
  paymentEmail: baseProfile.useCatchallBool
    ? `${randomFirstName}${randomLastName}@${baseProfile.catchallEmail}`
    : baseProfile.email,
  password: baseProfile.password,
  instagram: baseProfile.instagram,
  paymentCardholdersName: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
  paymentCardnumber: card.cardNumber,
  paymentexpMonth: card.expMonth,
  paymentexpYear: card.expYear,
  paymentCVV: card.cvv
});

export const convertBaseToNeutrino = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName
) => ({
  ...baseProfile,
  profileID: `Profile - ${index}`,
  deliveryFirstName: baseProfile.randomName
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  deliveryLastName: baseProfile.randomName
    ? randomLastName
    : baseProfile.deliveryLastName,
  email: baseProfile.useCatchallBool
    ? `${randomFirstName !== '' ? randomFirstName : randomName.first()}${
        randomLastName !== '' ? randomLastName : randomName.last()
      }@${baseProfile.catchallEmail}`
    : baseProfile.email,
  card
});

export const convertFromBase = (index, bot, profile) => {
  switch (bot) {
    case 'CyberSole':
      return convertBaseToCybersole(index, profile, profile.card, '', '');
    case 'Project Destroyer':
      return convertBaseToProjectDestroyer(
        index,
        profile,
        profile.card,
        '',
        ''
      );
    case 'Hastey':
      return convertBaseToHastey(index, profile, profile.card, '', '');
    case 'EVE AIO':
      return convertBaseToEVEAIO(index, profile, profile.card, '', '');
    case 'Phantom':
      return convertBaseToPhantom(index, profile, profile.card, '', '');
    case 'Ghost':
      return convertBaseToGhost(index, profile, profile.card, '', '');
    case 'CSV':
      return convertBaseToCSV(index, profile, profile.card, '', '');
    case 'NSB':
      return convertBaseToNSB(index, profile, profile.card, '', '');
    case 'SOLE AIO':
      return convertBaseToSOLEAIO(index, profile, profile.card, '', '');
    case 'TKS':
      return convertBaseToTKS(index, profile, profile.card, '', '');
    case 'Kodai':
      return convertBaseToKodai(index, profile, profile.card, '', '');
    case 'Dashe':
      return convertBaseToDashe(index, profile, profile.card, '', '');
    case 'Balko':
      return convertBaseToBalko(index, profile, profile.card, '', '');
    case 'Neutrino':
      return convertBaseToNeutrino(index, profile, profile.card, '', '');
    default:
      return undefined;
  }
};
