import Countries from '../../constants/countries';
import {
  tksCardMappings,
  longToShortCountries,
  longToShortStates
} from '../../constants/constants';
import { generateRandomNLengthString } from '../../utils/utils';

const uuidv4 = require('uuid/v4');

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const getCardType = number => {
  if (number) {
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
  }
  return '';
};

const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function* generate(email) {
  if (email.length <= 1) {
    yield email;
  } else {
    const head = email[0];
    const tail = email.slice(1);
    // eslint-disable-next-line no-restricted-syntax
    for (const item of generate(tail)) {
      yield head + item;
      yield `${head}.${item}`;
    }
  }
}

export const shuffle = array => {
  let counter = array.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter -= 1;
    const temp = array[counter];
    // eslint-disable-next-line no-param-reassign
    array[counter] = array[index];
    // eslint-disable-next-line no-param-reassign
    array[index] = temp;
  }

  return array;
};

export const generateGmailDotTrick = (length, email) => {
  let emails = [];
  const generator = generate(email);
  for (let i = 0; i < length * 100; i += 1) {
    emails.push(generator.next().value);
  }
  emails = emails.filter(e => !e.includes('.@'));
  return shuffle(emails);
};

const returnGmailOrCatchall = (
  index,
  gmailEmails,
  useCatchallBool,
  baseProfile
) => {
  if (gmailEmails && gmailEmails.length > 0 && gmailEmails[index]) {
    return gmailEmails[index];
  }
  if (
    useCatchallBool &&
    baseProfile.catchallEmail &&
    !baseProfile.catchallEmail.includes('@gmail')
  ) {
    return `${generateRandomNLengthString(10)}@${baseProfile.catchallEmail}`;
  }
  return baseProfile.email;
};

export const convertBaseToCybersole = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName,
  gmailEmails
) => ({
  name: `Profile - ${index}`,
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile,
    randomFirstName,
    randomLastName
  ),
  phone:
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  card: {
    number: card.cardNumber ? card.cardNumber.match(/.{1,4}/g).join(' ') : '',
    expiryMonth: card.expMonth,
    expiryYear: card.expYear,
    cvv: card.cvv
  },
  delivery: {
    firstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastName: baseProfile.randomNameBool
      ? randomLastName
      : baseProfile.deliveryLastName,
    address1: baseProfile.deliveryAddress,
    address2: baseProfile.deliveryApt,
    zip: baseProfile.deliveryZip,
    city: baseProfile.deliveryCity,
    country: baseProfile.deliveryCountry,
    state: baseProfile.deliveryRegion
  },
  billing: {
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    address1: baseProfile.billingAddress,
    address2: baseProfile.billingApt,
    zip: baseProfile.billingZip,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    state: baseProfile.billingRegion,
    same_as_del: baseProfile.sameDeliveryBillingBool
  },
  billingDifferent: !baseProfile.sameDeliveryBillingBool,
  singleCheckout: baseProfile.oneCheckoutBool,
  favourite: false
});

export const convertBaseToProjectDestroyer = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName,
  gmailEmails
) => ({
  billing: {
    address1: baseProfile.billingAddress,
    address2: baseProfile.billingApt,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
    expire:
      card.expMonth && card.expYear
        ? `${card.expMonth}/${card.expYear.slice(-2)}`
        : '',
    name:
      baseProfile.paymentCardholdersName ||
      `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
    number: card.cardNumber
  },
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
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
    firstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastName: baseProfile.randomNameBool
      ? randomLastName
      : baseProfile.deliveryLastName,
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
  randomLastName,
  gmailEmails
) => ({
  id: `Profile - ${index}`,
  firstname: baseProfile.randomNameBool
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  lastname: baseProfile.randomNameBool
    ? randomLastName
    : baseProfile.deliveryLastName,
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  phone:
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
  randomLastName,
  gmailEmails
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
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  BillingEmail: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  ShippingFirstName: baseProfile.randomNameBool
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  ShippingLastName: baseProfile.randomNameBool
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
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  ShippingEmail: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  NameOnCard:
    baseProfile.paymentCardholdersName ||
    `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
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
  randomLastName,
  gmailEmails
) => ({
  Billing: {
    Address: baseProfile.billingAddress,
    Apt: baseProfile.billingApt,
    City: baseProfile.billingCity,
    FirstName: baseProfile.billingFirstName,
    LastName: baseProfile.billingLastName,
    State:
      Countries[baseProfile.billingCountry] !== undefined &&
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
  Email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  ExpMonth: card.expMonth,
  ExpYear: card.expYear,
  Name: `Profile - ${index}`,
  Phone:
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
    FirstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    LastName: baseProfile.randomNameBool
      ? randomLastName
      : baseProfile.deliveryLastName,
    State:
      Countries[baseProfile.deliveryCountry] !== undefined &&
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
  randomLastName,
  gmailEmails
) => ({
  Billing: {
    Address: baseProfile.billingAddress,
    Apt: baseProfile.billingApt,
    City: baseProfile.billingCity,
    FirstName: baseProfile.billingFirstName,
    LastName: baseProfile.billingLastName,
    State:
      Countries[baseProfile.billingCountry] !== undefined &&
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
  Email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  ExpMonth: card.expMonth,
  ExpYear: card.expYear,
  Name: `Profile - ${index}`,
  Phone:
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
    FirstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    LastName: baseProfile.randomNameBool
      ? randomLastName
      : baseProfile.deliveryLastName,
    State:
      Countries[baseProfile.deliveryCountry] !== undefined &&
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
  randomLastName,
  gmailEmails
) => ({
  billing: {
    address: baseProfile.billingAddress,
    apt: baseProfile.billingApt,
    city: baseProfile.billingCity,
    country: baseProfile.billingCountry,
    firstName: baseProfile.billingFirstName,
    lastName: baseProfile.billingLastName,
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
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
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  profileName: `Profile - ${index}`,
  shipping: {
    address: baseProfile.deliveryAddress,
    apt: baseProfile.deliveryApt,
    city: baseProfile.deliveryCity,
    country: baseProfile.deliveryCountry,
    firstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastName: baseProfile.randomNameBool
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
  randomLastName,
  gmailEmails
) => ({
  Id: uuidv4(),
  Name: `Profile - ${index}`,
  Billing: {
    Email: returnGmailOrCatchall(
      index,
      gmailEmails,
      baseProfile.useCatchallBool,
      baseProfile,
      randomFirstName,
      randomLastName
    ),
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
      Countries[baseProfile.billingCountry] !== undefined &&
      Countries[baseProfile.billingCountry].province_codes[
        baseProfile.billingRegion
      ] !== undefined
        ? Countries[baseProfile.billingCountry].province_codes[
            baseProfile.billingRegion
          ]
        : '',
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  Shipping: {
    Pccc: null,
    Email: returnGmailOrCatchall(
      index,
      gmailEmails,
      baseProfile.useCatchallBool,
      baseProfile,
      randomFirstName,
      randomLastName
    ),
    FirstName: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    Lastname: baseProfile.randomNameBool
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
      Countries[baseProfile.deliveryCountry] !== undefined &&
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  Payment: {
    CardHolder:
      baseProfile.paymentCardholdersName ||
      `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
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
  randomLastName,
  gmailEmails
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
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
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
    baseProfile.randomNameBool ? randomFirstName : baseProfile.deliveryFirstName
  } ${
    baseProfile.randomNameBool ? randomLastName : baseProfile.deliveryLastName
  }`,
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
  randomLastName,
  gmailEmails
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
    emailAddress: returnGmailOrCatchall(
      index,
      gmailEmails,
      baseProfile.useCatchallBool,
      baseProfile,
      randomFirstName,
      randomLastName
    ),
    expirationDate:
      card.expMonth && card.expYear
        ? `${card.expMonth}/${card.expYear.slice(-2)}`
        : ''
  },
  profileName: `Profile - ${index}`,
  region: baseProfile.deliveryCountry
});

export const convertBaseToNSB = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName,
  gmailEmails
) => ({
  shipping: {
    firstname: baseProfile.randomNameBool
      ? randomFirstName
      : baseProfile.deliveryFirstName,
    lastname: baseProfile.randomNameBool
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
      Countries[baseProfile.deliveryCountry] !== undefined &&
      Countries[baseProfile.deliveryCountry].province_codes[
        baseProfile.deliveryRegion
      ] !== undefined
        ? Countries[baseProfile.deliveryCountry].province_codes[
            baseProfile.deliveryRegion
          ]
        : '',
    zip: baseProfile.deliveryZip,
    phone:
      baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
        ? baseProfile.randomPhoneNumberTemplate
            .split('#')
            .map(number => (number === '' ? getRandomInt(9) : number))
            .join('')
        : baseProfile.phone
  },
  name: `Profile - ${index}`,
  cc: {
    number: card.cardNumber ? card.cardNumber.match(/.{1,4}/g).join(' ') : '',
    expiry:
      card.expMonth && card.expYear
        ? `${card.expMonth} / ${card.expYear.slice(-2)}`
        : '',
    cvc: card.cvv,
    name:
      baseProfile.paymentCardholdersName ||
      `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`
  },
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
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
  randomLastName,
  gmailEmails
) => ({
  ID: index,
  ProfileName: `Profile - ${index}`,
  Email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  phone:
    baseProfile.randomPhoneNumberBool && baseProfile.randomPhoneNumberTemplate
      ? baseProfile.randomPhoneNumberTemplate
          .split('#')
          .map(number => (number === '' ? getRandomInt(9) : number))
          .join('')
      : baseProfile.phone,
  ShippingFirstName: baseProfile.randomNameBool
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  ShippingLastName: baseProfile.randomNameBool
    ? randomLastName
    : baseProfile.deliveryLastName,
  ShippingAddress1: baseProfile.deliveryAddress,
  ShippingAddress2: baseProfile.deliveryApt,
  ShippingCity: baseProfile.deliveryCity,
  ShippingZip: baseProfile.deliveryZip,
  ShippingCountry: baseProfile.deliveryCountry,
  ShippingState:
    Countries[baseProfile.deliveryCountry] !== undefined &&
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
    Countries[baseProfile.deliveryCountry] !== undefined &&
    Countries[baseProfile.deliveryCountry].province_codes[
      baseProfile.billingRegion
    ] !== undefined
      ? Countries[baseProfile.deliveryCountry].province_codes[
          baseProfile.billingRegion
        ]
      : '',
  CardNumber: card.cardNumber,
  CardName:
    baseProfile.paymentCardholdersName ||
    `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
  CardCvv: card.cvv,
  CardExpiryMonth: card.expMonth ? card.expMonth : '',
  CardExpiryYear: card.expYear ? card.expYear.slice(-2) : '',
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
  randomLastName,
  gmailEmails
) => ({
  profileID: `Profile - ${index}`,
  deliveryCountry: baseProfile.deliveryCountry,
  deliveryAddress: baseProfile.deliveryAddress,
  deliveryCity: baseProfile.deliveryCity,
  deliveryFirstName: baseProfile.randomNameBool
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  deliveryLastName: baseProfile.randomNameBool
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
  paymentEmail: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  password: baseProfile.password,
  instagram: baseProfile.instagram,
  paymentCardholdersName:
    baseProfile.paymentCardholdersName ||
    `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
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
  randomLastName,
  gmailEmails
) => ({
  ...baseProfile,
  profileID: `Profile - ${index}`,
  deliveryFirstName: baseProfile.randomNameBool
    ? randomFirstName
    : baseProfile.deliveryFirstName,
  deliveryLastName: baseProfile.randomNameBool
    ? randomLastName
    : baseProfile.deliveryLastName,
  email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  card
});

export const convertBaseToAdept = (
  index,
  baseProfile,
  card,
  randomFirstName,
  randomLastName,
  gmailEmails
) => ({
  profileName: `Profile - ${index}`,
  order_billing_name: `${baseProfile.billingFirstName} ${baseProfile.billingLastName}`,
  order_email: returnGmailOrCatchall(
    index,
    gmailEmails,
    baseProfile.useCatchallBool,
    baseProfile
  ),
  order_tel: baseProfile.randomPhoneNumberBool
    ? baseProfile.randomPhoneNumberTemplate
        .split('#')
        .map(number => (number === '' ? getRandomInt(9) : number))
        .join('')
    : baseProfile.phone,
  bo: baseProfile.billingAddress,
  oba3: '',
  order_billing_address_3: baseProfile.billingApt,
  order_billing_city: baseProfile.billingCity,
  order_billing_zip: baseProfile.billingZip,
  order_billing_state: longToShortStates[baseProfile.billingRegion]
    ? longToShortStates[baseProfile.billingRegion]
    : '',
  order_billing_country:
    longToShortCountries[baseProfile.billingCountry] !== undefined
      ? longToShortCountries[baseProfile.billingCountry]
      : '',
  credit_card_type: getCardType(card.cardNumber),
  cnb: card.cardNumber,
  credit_card_month: card.expMonth,
  credit_card_year: card.expYear,
  vval: card.cvv
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
    case 'Adept':
      return convertBaseToAdept(index, profile, profile.card, '', '');
    default:
      return undefined;
  }
};
