import Countries from '../store/countries';
import { shortToLongStates } from '../store/states';
const short2long = {
  AF: 'Afghanistan',
  AX: 'Aland Islands',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia, Plurinational State of',
  BQ: 'Bonaire, Sint Eustatius and Saba',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CV: 'Cape Verde',
  KY: 'Cayman Islands',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos (Keeling) Islands',
  CO: 'Colombia',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'Congo, The Democratic Republic of the',
  CK: 'Cook Islands',
  CR: 'Costa Rica',
  CI: "Côte d'Ivoire",
  HR: 'Croatia',
  CU: 'Cuba',
  CW: 'Curaçao',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  ET: 'Ethiopia',
  FK: 'Falkland Islands (Malvinas)',
  FO: 'Faroe Islands',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GF: 'French Guiana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam',
  GT: 'Guatemala',
  GG: 'Guernsey',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard Island and McDonald Islands',
  VA: 'Holy See (Vatican City State)',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran, Islamic Republic of',
  IQ: 'Iraq',
  IE: 'Ireland',
  IM: 'Isle of Man',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JE: 'Jersey',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: "Korea, Democratic People's Republic of",
  KR: 'Korea, Republic of',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: "Lao People's Democratic Republic",
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macao',
  MK: 'Macedonia, Republic of',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia, Federated States of',
  MD: 'Moldova, Republic of',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  NC: 'New Caledonia',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MP: 'Northern Mariana Islands',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestinian Territory, Occupied',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PN: 'Pitcairn',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  RE: 'Réunion',
  RO: 'Romania',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  BL: 'Saint Barthélemy',
  SH: 'Saint Helena, Ascension and Tristan da Cunha',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  MF: 'Saint Martin (French part)',
  PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SX: 'Sint Maarten (Dutch part)',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia and the South Sandwich Islands',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SS: 'South Sudan',
  SJ: 'Svalbard and Jan Mayen',
  SZ: 'Swaziland',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TW: 'Taiwan, Province of China',
  TJ: 'Tajikistan',
  TZ: 'Tanzania, United Republic of',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States',
  UM: 'United States Minor Outlying Islands',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela, Bolivarian Republic of',
  VN: 'Viet Nam',
  VG: 'Virgin Islands, British',
  VI: 'Virgin Islands, U.S.',
  WF: 'Wallis and Futuna',
  EH: 'Western Sahara',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe'
};

const getCardType = number => {
  var re = new RegExp('^4');
  if (number.match(re) != null) return 'visa';
  if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number)) return 'master';
  re = new RegExp('^3[47]');
  if (number.match(re) != null) return 'american_express';
  re = new RegExp('^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)');
  return '';
};

const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
};

const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const cybersoleProfileToBase = (profile, index) => {
  return {
    profileID: profile.name,
    deliveryCountry: profile.delivery.country,
    deliveryAddress: profile.delivery.addr1,
    deliveryCity: profile.delivery.city,
    deliveryFirstName: profile.delivery.first_name,
    deliveryLastName: profile.delivery.last_name,
    deliveryProvince: profile.delivery.state,
    deliveryZip: profile.delivery.zip,
    deliveryAptorSuite: profile.delivery.addr2,
    billingZip: profile.billing.zip,
    billingCountry: profile.billing.country,
    billingAddress: profile.billing.addr1,
    billingCity: profile.billing.city,
    billingFirstName: profile.billing.first_name,
    billingLastName: profile.billing.last_name,
    billingProvince: profile.billing.state,
    billingAptorSuite: profile.billing.addr2,
    phoneNumber: profile.payment.phone,
    paymentCardholdersName: profile.payment.card.name,
    paymentCardnumber: profile.payment.card.number,
    paymentCardExpiryMonth: profile.payment.card.exp_month,
    paymentCardExpiryYear: profile.payment.card.exp_year,
    paymentCVV: profile.payment.card.cvv,
    email: profile.payment.email,
    sameAsDelivery: profile.billing.same_as_del,
    oneCheckout: profile.one_checkout
  };
};

export const projectDestroyerProfileToBase = (profile, index) => {
  return {
    profileID: profile.title,
    deliveryCountry: profile.shipping.country,
    deliveryAddress: profile.shipping.address1,
    deliveryCity: profile.shipping.city,
    deliveryFirstName: profile.shipping.firstName,
    deliveryLastName: profile.shipping.lastName,
    deliveryProvince: profile.shipping.state,
    deliveryZip: profile.shipping.zipcode,
    deliveryAptorSuite: profile.shipping.address2,
    billingZip: profile.billing.zipcode,
    billingCountry: profile.billing.country,
    billingAddress: profile.billing.address1,
    billingCity: profile.billing.city,
    billingFirstName: profile.billing.firstName,
    billingLastName: profile.billing.lastName,
    billingProvince: profile.billing.state,
    billingAptorSuite: profile.billing.address2,
    phoneNumber: profile.billing.phone,
    paymentCardholdersName: profile.card.name,
    paymentCardnumber: profile.card.number,
    paymentCardExpiryMonth: profile.card.expire.split(' / ')[0],
    paymentCardExpiryYear: profile.card.expire.split(' / ')[1],
    paymentCVV: profile.card.code,
    email: profile.email,
    sameAsDelivery: profile.match,
    oneCheckout: profile.limit
  };
};
export const ghostProfileToBase = (profile, index) => {
  return {
    profileID: profile.Name,
    deliveryCountry: profile.Country,
    deliveryAddress: profile.Shipping.Address,
    deliveryCity: profile.Shipping.City,
    deliveryFirstName: profile.Shipping.FirstName,
    deliveryLastName: profile.Shipping.LastName,
    deliveryProvince: profile.Shipping.State,
    deliveryZip: profile.Shipping.Zip,
    deliveryAptorSuite: profile.Shipping.Apt,
    billingZip: profile.Billing.Zip,
    billingCountry: profile.Country,
    billingAddress: profile.Billing.Address,
    billingCity: profile.Billing.City,
    billingFirstName: profile.Billing.FirstName,
    billingLastName: profile.Billing.LastName,
    billingProvince: profile.Billing.State,
    billingAptorSuite: profile.Billing.Apt,
    phoneNumber: profile.Phone,
    paymentCardholdersName: '',
    paymentCardnumber: profile.CCNumber,
    paymentCardExpiryMonth: profile.ExpMonth,
    paymentCardExpiryYear: profile.ExpYear,
    paymentCVV: profile.CVV,
    email: '',
    phoneNumber: '',
    sameAsDelivery: profile.Same,
    oneCheckout: false
  };
};
export const balkoProfileToBase = (profile, index) => {
  return {
    profileID: profile.id,
    deliveryCountry: profile.country,
    deliveryAddress: profile.add1,
    deliveryCity: profile.city,
    deliveryFirstName: profile.firstname,
    deliveryLastName: profile.lastname,
    deliveryProvince: profile.state,
    deliveryZip: profile.zip,
    deliveryAptorSuite: profile.add2,
    billingZip: profile.zip,
    billingCountry: profile.bcountry,
    billingAddress: profile.badd1,
    billingCity: profile.bcity,
    billingFirstName: profile.bfirstname,
    billingLastName: profile.blastname,
    billingProvince: profile.bstate,
    billingAptorSuite: profile.badd2,
    phoneNumber: profile.phone,
    paymentCardholdersName: `${profile.ccfirst} ${profile.cclast}`,
    paymentCardnumber: profile.cc,
    paymentCardExpiryMonth: profile.expm,
    paymentCardExpiryYear: profile.expy,
    paymentCVV: profile.ccv,
    email: profile.email,
    phoneNumber: profile.phone,
    sameAsDelivery: false,
    oneCheckout: false
  };
};
export const eveaioProfileToBase = (profile, index) => {
  return {
    profileID: profile.ProfileName,
    deliveryCountry: short2long[profile.ShippingCountryCode] || '',
    deliveryAddress: profile.ShippingAddressLine1,
    deliveryCity: profile.ShippingCity,
    deliveryFirstName: profile.ShippingFirstName,
    deliveryLastName: profile.ShippingLastName,
    deliveryProvince: shortToLongStates[profile.ShippingState] || '',
    deliveryZip: profile.ShippingZip,
    deliveryAptorSuite: profile.ShippingAddressLine2,
    billingZip: profile.BillingZip,
    billingCountry: short2long[profile.BillingCountryCode] || '',
    billingAddress: profile.BillingAddressLine1,
    billingCity: profile.BillingCity,
    billingFirstName: profile.BillingFirstName,
    billingLastName: profile.BillingLastName,
    billingProvince: shortToLongStates[profile.BillingState] || '',
    billingAptorSuite: profile.BillingAddressLine2,
    phoneNumber: profile.ShippingPhone,
    paymentCardholdersName: profile.NameOnCard,
    paymentCardnumber: profile.CreditCardNumber,
    paymentCardExpiryMonth: profile.ExpirationMonth,
    paymentCardExpiryYear: profile.ExpirationYear,
    paymentCVV: profile.Cvv,
    email: profile.BillingEmail,
    sameAsDelivery: profile.SameBillingShipping,
    oneCheckout: profile.OneCheckoutPerWebsite
  };
};
export const phantomProfileToBase = (profile, index) => {
  return {
    profileID: profile.Name,
    deliveryCountry: profile.Country,
    deliveryAddress: profile.Shipping.Address,
    deliveryCity: profile.Shipping.City,
    deliveryFirstName: profile.Shipping.FirstName,
    deliveryLastName: profile.Shipping.LastName,
    deliveryProvince: profile.Shipping.State,
    deliveryZip: profile.Shipping.Zip,
    deliveryAptorSuite: profile.Shipping.Apt,
    billingZip: profile.Billing.Zip,
    billingCountry: profile.Country,
    billingAddress: profile.Billing.Address,
    billingCity: profile.Billing.City,
    billingFirstName: profile.Billing.FirstName,
    billingLastName: profile.Billing.LastName,
    billingProvince: profile.Billing.State,
    billingAptorSuite: profile.Billing.Apt,
    phoneNumber: profile.Phone,
    paymentCardholdersName: '',
    paymentCardnumber: profile.CCNumber,
    paymentCardExpiryMonth: profile.ExpMonth,
    paymentCardExpiryYear: profile.ExpYear,
    paymentCVV: profile.CVV,
    email: profile.Email,
    phoneNumber: profile.Phone,
    sameAsDelivery: profile.Same,
    oneCheckout: false
  };
};
export const dasheProfileToBase = (profile, index) => {
  return {
    profileID: profile.profileName,
    deliveryCountry: profile.shipping.country,
    deliveryAddress: profile.shipping.address,
    deliveryCity: profile.shipping.city,
    deliveryFirstName: profile.shipping.firstName,
    deliveryLastName: profile.shipping.lastName,
    deliveryProvince: profile.shipping.state,
    deliveryZip: profile.shipping.zipCode,
    deliveryAptorSuite: profile.shipping.apt,
    billingZip: profile.billing.zipcode,
    billingCountry: profile.billing.country,
    billingAddress: profile.billing.address,
    billingCity: profile.billing.city,
    billingFirstName: profile.billing.firstName,
    billingLastName: profile.billing.lastName,
    billingProvince: profile.billing.state,
    billingAptorSuite: profile.billing.apt,
    phoneNumber: profile.billing.phone,
    paymentCardholdersName: profile.holder,
    paymentCardnumber: profile.card.number,
    paymentCardExpiryMonth: profile.card.month,
    paymentCardExpiryYear: profile.card.year,
    paymentCVV: profile.card.cvv,
    email: profile.email,
    phoneNumber: profile.billing.phone,
    sameAsDelivery: profile.billingMatch,
    oneCheckout: false
  };
};
export const hasteyProfileToBase = (profile, index) => {
  return {
    profileID: profile.__profile__name,
    deliveryCountry: profile.country,
    deliveryAddress: profile.address,
    deliveryCity: profile.city,
    deliveryFirstName: profile.name.split(' ')[0],
    deliveryLastName: profile.name.split(' ')[1],
    deliveryProvince: profile.state,
    deliveryZip: profile.zip,
    deliveryAptorSuite: profile.address_2,
    billingZip: profile.zip,
    billingCountry: profile.country,
    billingAddress: profile.address,
    billingCity: profile.city,
    billingFirstName: profile.name.split(' ')[0],
    billingLastName: profile.name.split(' ')[1],
    billingProvince: profile.state,
    billingAptorSuite: profile.address_2,
    paymentCardholdersName: profile.name,
    paymentCardnumber: profile.cc_number,
    paymentCardExpiryMonth: profile.cc_month,
    paymentCardExpiryYear: profile.cc_year,
    paymentCVV: profile.cc_cvv,
    email: profile.email,
    phoneNumber: profile.tel,
    sameAsDelivery: false,
    oneCheckout: false
  };
};
export const kodaiProfileToBase = (profile, index) => {
  return {
    profileID: profile.profileName,
    deliveryCountry: profile.region,
    deliveryAddress: profile.deliveryAddress.address,
    deliveryCity: profile.deliveryAddress.city,
    deliveryFirstName: profile.deliveryAddress.firstName,
    deliveryLastName: profile.deliveryAddress.lastName,
    deliveryProvince: profile.deliveryAddress.state,
    deliveryZip: profile.deliveryAddress.zipCode,
    deliveryAptorSuite: profile.deliveryAddress.apt,
    billingZip: profile.billingAddress.zipCode,
    billingCountry: profile.region,
    billingAddress: profile.billingAddress.address,
    billingCity: profile.billingAddress.city,
    billingFirstName: profile.billingAddress.firstName,
    billingLastName: profile.billingAddress.lastName,
    billingProvince: profile.billingAddress.state,
    billingAptorSuite: profile.billingAddress.apt,
    phoneNumber: profile.billingAddress.phoneNumber,
    paymentCardholdersName: profile.paymentDetails.cardHolder,
    paymentCardnumber: profile.paymentDetails.paymentCardnumber,
    paymentCardExpiryMonth: profile.paymentDetails.expirationDate.split('/')[0],
    paymentCardExpiryYear: `20${profile.paymentDetails.expirationDate.split('/')[1]}`,
    paymentCVV: profile.paymentDetails.paymentCVV,
    email: profile.paymentDetails.emailAddress,
    sameAsDelivery: profile.miscellaneousInformation.deliverySameAsBilling,
    oneCheckout: false
  };
};
export const nsbProfileToBase = (profile, index) => {
  return {
    profileID: profile.name,
    deliveryCountry: short2long[profile.shipping.country] || '',
    deliveryAddress: profile.shipping.address,
    deliveryCity: profile.shipping.city,
    deliveryFirstName: profile.shipping.firstname,
    deliveryLastName: profile.shipping.lastname,
    deliveryProvince: shortToLongStates[profile.shipping.state],
    deliveryZip: profile.shipping.zip,
    deliveryAptorSuite: profile.shipping.address2,
    billingZip: profile.shipping.zip,
    billingCountry: short2long[profile.shipping.country] || '',
    billingAddress: profile.shipping.address,
    billingCity: profile.shipping.city,
    billingFirstName: profile.shipping.firstname,
    billingLastName: profile.shipping.lastname,
    billingProvince: shortToLongStates[profile.shipping.state] || '',
    billingAptorSuite: profile.shipping.address2,
    paymentCardholdersName: profile.cc.name,
    paymentCardnumber: profile.cc.number.split(' ').join(''),
    paymentCardExpiryMonth: profile.cc.expiry.split(' / ')[0],
    paymentCardExpiryYear: `20${profile.cc.expiry.split(' / ')[1]}`,
    paymentCVV: profile.cc.cvc,
    email: profile.email,
    phoneNumber: profile.phone,
    sameAsDelivery: profile.billingSame,
    oneCheckout: profile.checkoutLimit > 0 ? true : false
  };
};
export const soleAioProfileToBase = (profile, index) => {
  return {
    profileID: profile.ProfileName,
    deliveryCountry: profile.ShippingCountry,
    deliveryAddress: profile.ShippingAddress1,
    deliveryCity: profile.ShippingCity,
    deliveryFirstName: profile.ShippingFirstName,
    deliveryLastName: profile.ShippingLastName,
    deliveryProvince: shortToLongStates[profile.ShippingState],
    deliveryZip: profile.ShippingZip,
    deliveryAptorSuite: profile.ShippingAddress2,
    billingZip: profile.BillingZip,
    billingCountry: profile.BillingCountry,
    billingAddress: profile.BillingAddress1,
    billingCity: profile.BillingCity,
    billingFirstName: profile.BillingFirstName,
    billingLastName: profile.BillingLastName,
    billingProvince: shortToLongStates[profile.BillingState],
    billingAptorSuite: profile.BillingAddress2,
    paymentCardholdersName: profile.CardName,
    paymentCardnumber: profile.paymentCardnumber,
    paymentCardExpiryMonth: profile.paymentCardExpiryMonth,
    paymentCardExpiryYear: `20${profile.paymentCardExpiryYear}`,
    paymentCVV: profile.paymentCVV,
    email: profile.Email,
    phoneNumber: profile.Phone,
    sameAsDelivery: false,
    oneCheckout: false
  };
};

export const baseProfileToProjectDestroyer = (profile, index) => {
  return {
    billing: {
      address1: profile.billingAddress,
      address2: profile.billingAptorSuite,
      city: profile.billingCity,
      country: profile.billingCountry,
      firstName: profile.billingFirstName,
      lastName: profile.billingLastName,
      phone: profile.phoneNumber,
      state: profile.billingProvince,
      zipcode: profile.billingZip
    },
    card: {
      code: profile.paymentCVV,
      expire: profile.paymentCardExpiryMonth + ' / ' + profile.paymentCardExpiryYear,
      name: `${profile.deliveryFirstName} ${profile.deliveryLastName}`,
      number: profile.paymentCardnumber
    },
    email: profile.email,
    id: Math.random()
      .toString(36)
      .substring(2, 10),
    limit: profile.oneCheckout,
    match: profile.sameAsDelivery,
    shipping: {
      address1: profile.deliveryAddress,
      address2: profile.deliveryAptorSuite,
      city: profile.deliveryCity,
      country: profile.deliveryCountry,
      firstName: profile.deliveryFirstName,
      lastName: profile.deliveryLastName,
      phone: profile.phoneNumber,
      state: profile.deliveryProvince,
      zipcode: profile.deliveryZip
    },
    title: profile.profileID
  };
};

export const baseProfileToGhost = (profile, index) => {
  return {
    CCNumber: profile.paymentCardnumber,
    CVV: profile.paymentCVV,
    ExpMonth: profile.paymentCardExpiryMonth,
    ExpYear: profile.paymentCardExpiryYear,
    CardType: getCardType(profile.paymentCardnumber),
    Same: profile.sameAsDelivery,
    Shipping: {
      FirstName: profile.deliveryFirstName,
      LastName: profile.deliveryLastName,
      Address: profile.deliveryAddress,
      Apt: profile.deliveryAptorSuite,
      City: profile.deliveryCity,
      State: profile.deliveryProvince,
      Zip: profile.deliveryZip
    },
    Billing: {
      FirstName: profile.billingFirstName,
      LastName: profile.billingLastName,
      Address: profile.billingAddress,
      Apt: profile.billingAptorSuite,
      City: profile.billingCity,
      State: profile.billingProvince,
      Zip: profile.billingZip
    },
    Phone: profile.phoneNumber,
    Name: `Profile - ${index}`,
    Country: profile.deliveryCountry
  };
};

export const baseProfileToBalko = (profile, index) => {
  return {
    id: `Profile - ${index}`,
    firstname: profile.deliveryFirstName,
    lastname: profile.deliveryLastName,
    email: profile.email,
    phone: profile.phoneNumber,
    add1: profile.deliveryAddress,
    add2: profile.deliveryAptorSuite,
    state: profile.deliveryProvince,
    zip: profile.deliveryZip,
    country: profile.deliveryCountry,
    city: profile.deliveryCity,
    ccfirst: profile.billingFirstName,
    cclast: profile.billingLastName,
    cc: profile.paymentCardnumber,
    expm: profile.paymentCardExpiryMonth,
    expy: profile.paymentCardExpiryYear,
    ccv: profile.paymentCVV,
    oneCheckout: false,
    bfirstname: profile.billingFirstName,
    blastname: profile.billingLastName,
    badd1: profile.billingAddress,
    badd2: profile.billingAptorSuite,
    bstate: profile.billingProvince,
    bzip: profile.billingZip,
    bcountry: profile.billingCountry,
    bcity: profile.billingCity
  };
};
export const baseProfileToEveaio = (profile, index) => {
  return {
    ProfileName: `Profile - ${index}`,
    BillingFirstName: profile.billingFirstName,
    BillingLastName: profile.billingLastName,
    BillingAddressLine1: profile.billingAddress,
    BillingAddressLine2: profile.billingAptorSuite,
    BillingCity: profile.billingCity,
    BillingState: profile.billingProvince,
    BillingCountryCode: profile.deliveryCountry && Countries[profile.deliveryCountry] !== undefined ? Countries[profile.deliveryCountry].code : '',
    BillingZip: profile.billingZip,
    BillingPhone: profile.phoneNumber,
    BillingEmail: profile.email,
    ShippingFirstName: profile.deliveryFirstName,
    ShippingLastName: profile.deliveryLastName,
    ShippingAddressLine1: profile.deliveryAddress,
    ShippingAddressLine2: profile.deliveryAptorSuite,
    ShippingCity: profile.deliveryCity,
    ShippingState: profile.deliveryProvince,
    ShippingCountryCode: profile.deliveryCountry,
    ShippingZip: profile.deliveryZip,
    ShippingPhone: profile.phoneNumber,
    ShippingEmail: profile.email,
    NameOnCard: profile.billingFirstName + ' ' + profile.billingLastName,
    CreditCardNumber: profile.paymentCardnumber,
    ExpirationMonth: profile.paymentCardExpiryMonth,
    ExpirationYear: profile.paymentCardExpiryYear,
    Cvv: profile.paymentCVV,
    CardType: getCardType(profile.paymentCardnumber),
    OneCheckoutPerWebsite: profile.oneCheckout,
    SameBillingShipping: profile.sameAsDelivery,
    BirthDay: '',
    BirthMonth: '',
    BirthYear: ''
  };
};
export const baseProfileToPhantom = (profile, index) => {
  return {
    Billing: {
      Address: profile.billingAddress,
      Apt: profile.billingAptorSuite,
      City: profile.billingCity,
      FirstName: profile.billingFirstName,
      LastName: profile.billingLastName,
      State: profile.billingProvince,
      Zipcode: profile.billingZip
    },
    CCNumber: profile.paymentCardnumber,
    CVV: profile.paymentCVV,
    CardType: getCardType(profile.paymentCardnumber),
    Country: profile.deliveryCountry,
    Email: profile.email,
    ExpMonth: profile.paymentCardExpiryMonth,
    ExpYear: profile.paymentCardExpiryYear,
    Name: `Profile - ${index}`,
    Phone: profile.phoneNumber,
    Same: profile.sameAsDelivery,
    Shipping: {
      Address: profile.deliveryAddress,
      Apt: profile.deliveryAptorSuite,
      City: profile.deliveryCity,
      FirstName: profile.deliveryFirstName,
      LastName: profile.deliveryLastName,
      State: profile.deliveryProvince,
      Zipcode: profile.deliveryZip
    }
  };
};
export const baseProfileToDashe = (profile, index) => {
  return {
    billing: {
      address: profile.billingAddress,
      apt: profile.billingAptorSuite,
      city: profile.billingCity,
      country: profile.billingCountry,
      firstName: profile.billingFirstName,
      lastName: profile.billingLastName,
      phone: profile.phoneNumber,
      state: profile.billingProvince,
      zipcode: profile.billingZip
    },
    billingMatch: profile.sameAsDelivery,
    card: {
      cvv: profile.paymentCVV,
      holder: profile.deliveryFirstName + ' ' + profile.deliveryLastName,
      month: profile.paymentCardExpiryMonth,
      number: profile.paymentCardnumber,
      year: profile.paymentCardExpiryYear
    },
    email: profile.email,
    profileName: `Profile - ${index}`,
    shipping: {
      address: profile.deliveryAddress,
      apt: profile.deliveryAptorSuite,
      city: profile.deliveryCity,
      country: profile.deliveryCountry,
      firstName: profile.deliveryFirstName,
      lastName: profile.deliveryLastName,
      phoneNumber: profile.phoneNumber,
      state: profile.deliveryProvince,
      zipCode: profile.deliveryZip
    }
  };
};
export const baseProfileToHastey = (profile, index) => {
  return {
    __profile__name: `Profile - ${index}`,
    address: profile.deliveryAddress,
    address_2: profile.deliveryAptorSuite,
    cardType: getCardType(profile.paymentCardnumber),
    cc_cvv: profile.paymentCVV,
    cc_month: profile.paymentCardExpiryMonth,
    cc_number: profile.paymentCardnumber,
    cc_year: profile.paymentCardExpiryYear,
    city: profile.deliveryCity,
    country: profile.deliveryCountry,
    email: profile.email,
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
    name: `${profile.deliveryFirstName} ${profile.deliveryLastName}`,
    state: profile.deliveryProvince,
    tel: profile.phoneNumber,
    zip: profile.deliveryZip
  };
};
export const baseProfileToKodai = (profile, index) => {
  return {
    billingAddress: {
      address: profile.billingAddress,
      apt: profile.billingAptorSuite,
      city: profile.billingCity,
      firstName: profile.billingFirstName,
      lastName: profile.billingLastName,
      phoneNumber: profile.phoneNumber,
      state: profile.billingProvince,
      zipCode: profile.billingZip
    },
    deliveryAddress: {
      address: profile.deliveryAddress,
      apt: profile.deliveryAptorSuite,
      city: profile.deliveryCity,
      firstName: profile.deliveryFirstName,
      lastName: profile.deliveryLastName,
      phoneNumber: profile.phoneNumber,
      state: profile.deliveryProvince,
      zipCode: profile.deliveryZip
    },
    miscellaneousInformation: { deliverySameAsBilling: profile.sameAsDelivery },
    paymentDetails: {
      cardHolder: profile.deliveryFirstName + ' ' + profile.deliveryLastName,
      cardNumber: profile.paymentCardnumber,
      cvv: profile.paymentCVV,
      emailAddress: profile.email,
      expirationDate: `${profile.paymentCardExpiryMonth}/${profile.paymentCardExpiryYear.slice(-2)}`
    },
    profileName: `Profile - ${index}`,
    region: profile.deliveryCountry
  };
};
export const baseProfileToNsb = (profile, index) => {
  return {
    shipping: {
      firstname: profile.deliveryFirstName,
      lastname: profile.deliveryLastName,
      country: profile.deliveryCountry && Countries[profile.deliveryCountry] !== undefined ? Countries[profile.deliveryCountry].code : '',
      city: profile.deliveryCity,
      address: profile.deliveryAddress,
      address2: profile.deliveryAptorSuite,
      state:
        profile.deliveryCountry && Countries[profile.deliveryCountry].province_codes[profile.deliveryProvince] !== undefined
          ? Countries[profile.deliveryCountry].province_codes[profile.deliveryProvince]
          : '',
      zip: profile.deliveryZip,
      phone: profile.phoneNumber
    },
    name: `Profile - ${index}`,
    cc: {
      number: profile.paymentCardnumber.match(/.{1,4}/g).join(' '),
      expiry: `${profile.paymentCardExpiryMonth} / ${profile.paymentCardExpiryYear.slice(-2)}`,
      cvc: profile.paymentCVV,
      name: `${profile.billingFirstName} ${profile.billingLastName}`
    },
    email: profile.email,
    checkoutLimit: 0,
    billingSame: profile.sameAsDelivery,
    date: +new Date(),
    id: index
  };
};
export const baseProfileToSoleAio = (profile, index) => {
  return {
    ID: index,
    ProfileName: `Profile - ${index}`,
    Email: profile.email,
    Phone: profile.phoneNumber,
    ShippingFirstName: profile.deliveryFirstName,
    ShippingLastName: profile.deliveryLastName,
    ShippingAddress1: profile.deliveryAddress,
    ShippingAddress2: profile.deliveryAptorSuite,
    ShippingCity: profile.deliveryCity,
    ShippingZip: profile.deliveryZip,
    ShippingCountry: profile.deliveryCountry,
    ShippingState:
      profile.deliveryCountry && Countries[profile.deliveryCountry].province_codes[profile.deliveryProvince] !== undefined
        ? Countries[profile.deliveryCountry].province_codes[profile.deliveryProvince]
        : '',
    UseBilling: !profile.sameAsDelivery,
    BillingFirstName: profile.billingFirstName,
    BillingLastName: profile.billingLastName,
    BillingAddress1: profile.billingAddress,
    BillingAddress2: profile.billingAptorSuite,
    BillingCity: profile.billingCity,
    BillingZip: profile.billingZip,
    BillingCountry: profile.billingCountry,
    BillingState:
      profile.deliveryCountry && Countries[profile.deliveryCountry].province_codes[profile.billingProvince] !== undefined
        ? Countries[profile.deliveryCountry].province_codes[profile.billingProvince]
        : '',
    CardNumber: profile.paymentCardnumber,
    CardName: `${profile.billingFirstName} ${profile.billingLastName}`,
    CardCvv: profile.paymentCVV,
    CardExpiryMonth: profile.paymentCardExpiryMonth,
    CardExpiryYear: profile.paymentCardExpiryYear.slice(-2),
    CardType: capitalize(getCardType(profile.paymentCardnumber)),
    CheckoutLimit: 'No checkout limit'
  };
};
export const baseProfileToCsv = (profile, index) => {
  return {
    profileID: `Profile - ${index}`,
    deliveryCountry: profile.deliveryCountry,
    deliveryAddress: profile.deliveryAddress,
    deliveryCity: profile.deliveryCity,
    deliveryFirstName: profile.deliveryFirstName,
    deliveryLastName: profile.deliveryLastName,
    deliveryProvince: profile.deliveryProvince,
    deliveryZip: profile.deliveryZip,
    deliveryAptorSuite: profile.deliveryAptorSuite,
    billingZip: profile.billingZip,
    billingCountry: profile.billingCountry,
    billingAddress: profile.billingAddress,
    billingCity: profile.billingCity,
    billingFirstName: profile.billingFirstName,
    billingLastName: profile.billingLastName,
    billingProvince: profile.billingProvince,
    billingAptorSuite: profile.billingAptorSuite,
    phoneNumber: profile.phoneNumber,
    paymentEmail: profile.email,
    paymentCardholdersName: profile.paymentCardholdersName,
    paymentCardnumber: profile.paymentCardnumber,
    paymentCardExpiryMonth: profile.paymentCardExpiryMonth,
    paymentCardExpiryYear: profile.paymentCardExpiryYear,
    paymentCVV: profile.paymentCVV
  };
};
