import {
  shortToLongCountries,
  shortToLongStates
} from '../../constants/constants';

export const convertCybersoleToBase = profile => ({
  profileID: profile.name,
  deliveryCountry: profile.delivery.country,
  deliveryAddress: profile.delivery.addr1,
  deliveryCity: profile.delivery.city,
  deliveryFirstName: profile.delivery.first_name,
  deliveryLastName: profile.delivery.last_name,
  deliveryRegion: profile.delivery.state,
  deliveryZip: profile.delivery.zip,
  deliveryApt: profile.delivery.addr2,
  billingZip: profile.billing.zip,
  billingCountry: profile.billing.country,
  billingAddress: profile.billing.addr1,
  billingCity: profile.billing.city,
  billingFirstName: profile.billing.first_name,
  billingLastName: profile.billing.last_name,
  billingRegion: profile.billing.state,
  billingApt: profile.billing.addr2,
  phone: profile.payment.phone,
  card: {
    paymentCardholdersName: profile.payment.card.name,
    cardNumber: profile.payment.card.number,
    expMonth: profile.payment.card.exp_month,
    expYear: profile.payment.card.exp_year,
    cvv: profile.payment.card.cvv
  },
  email: profile.payment.email,
  password: '',
  sameDeliveryBillingBool: profile.billing.same_as_del,
  oneCheckoutBool: profile.one_checkout,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertProjectDestroyerToBase = profile => ({
  profileID: profile.title,
  deliveryCountry: profile.shipping.country,
  deliveryAddress: profile.shipping.address1,
  deliveryCity: profile.shipping.city,
  deliveryFirstName: profile.shipping.firstName,
  deliveryLastName: profile.shipping.lastName,
  deliveryRegion: profile.shipping.state,
  deliveryZip: profile.shipping.zipcode,
  deliveryApt: profile.shipping.address2,
  billingZip: profile.billing.zipcode,
  billingCountry: profile.billing.country,
  billingAddress: profile.billing.address1,
  billingCity: profile.billing.city,
  billingFirstName: profile.billing.firstName,
  billingLastName: profile.billing.lastName,
  billingRegion: profile.billing.state,
  billingApt: profile.billing.address2,
  phone: profile.billing.phone,
  card: {
    paymentCardholdersName: profile.card.name,
    cardNumber: profile.card.number,
    expMonth: profile.card.expire.split('/ ')[0].trim(),
    expYear: profile.card.expire.split('/')[1].trim(),
    cvv: profile.card.code
  },
  email: profile.email,
  password: '',
  sameDeliveryBillingBool: profile.match,
  oneCheckoutBool: profile.limit,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertGhostToBase = profile => ({
  profileID: profile.Name,
  deliveryCountry: profile.Country,
  deliveryAddress: profile.Shipping.Address,
  deliveryCity: profile.Shipping.City,
  deliveryFirstName: profile.Shipping.FirstName,
  deliveryLastName: profile.Shipping.LastName,
  deliveryRegion: profile.Shipping.State,
  deliveryZip: profile.Shipping.Zip,
  deliveryApt: profile.Shipping.Apt,
  billingZip: profile.Billing.Zip,
  billingCountry: profile.Country,
  billingAddress: profile.Billing.Address,
  billingCity: profile.Billing.City,
  billingFirstName: profile.Billing.FirstName,
  billingLastName: profile.Billing.LastName,
  billingRegion: profile.Billing.State,
  billingApt: profile.Billing.Apt,
  phone: profile.Phone,
  card: {
    paymentCardholdersName: '',
    cardNumber: profile.CCNumber,
    expMonth: profile.ExpMonth,
    expYear: profile.ExpYear,
    cvv: profile.CVV
  },
  email: '',
  password: '',
  sameDeliveryBillingBool: profile.Same,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertBalkoToBase = profile => ({
  profileID: profile.id,
  deliveryCountry: profile.country,
  deliveryAddress: profile.add1,
  deliveryCity: profile.city,
  deliveryFirstName: profile.firstname,
  deliveryLastName: profile.lastname,
  deliveryRegion: profile.state,
  deliveryZip: profile.zip,
  deliveryApt: profile.add2,
  billingZip: profile.zip,
  billingCountry: profile.bcountry,
  billingAddress: profile.badd1,
  billingCity: profile.bcity,
  billingFirstName: profile.bfirstname,
  billingLastName: profile.blastname,
  billingRegion: profile.bstate,
  billingApt: profile.badd2,
  phone: profile.phone,
  card: {
    paymentCardholdersName: `${profile.ccfirst} ${profile.cclast}`,
    cardNumber: profile.cc,
    expMonth: profile.expm,
    expYear: profile.expy,
    cvv: profile.ccv
  },
  email: profile.email,
  password: '',
  sameDeliveryBillingBool: false,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertEveaioToBase = profile => ({
  profileID: profile.ProfileName,
  deliveryCountry: shortToLongCountries[profile.ShippingCountryCode] || '',
  deliveryAddress: profile.ShippingAddressLine1,
  deliveryCity: profile.ShippingCity,
  deliveryFirstName: profile.ShippingFirstName,
  deliveryLastName: profile.ShippingLastName,
  deliveryRegion: shortToLongStates[profile.ShippingState] || '',
  deliveryZip: profile.ShippingZip,
  deliveryApt: profile.ShippingAddressLine2,
  billingZip: profile.BillingZip,
  billingCountry: shortToLongCountries[profile.BillingCountryCode] || '',
  billingAddress: profile.BillingAddressLine1,
  billingCity: profile.BillingCity,
  billingFirstName: profile.BillingFirstName,
  billingLastName: profile.BillingLastName,
  billingRegion: shortToLongStates[profile.BillingState] || '',
  billingApt: profile.BillingAddressLine2,
  phone: profile.ShippingPhone,
  card: {
    paymentCardholdersName: profile.NameOnCard,
    cardNumber: profile.CreditCardNumber,
    expMonth: profile.ExpirationMonth,
    expYear: profile.ExpirationYear,
    cvv: profile.Cvv
  },
  email: profile.BillingEmail,
  password: '',
  sameDeliveryBillingBool: profile.SameBillingShipping,
  oneCheckoutBool: profile.OneCheckoutPerWebsite,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertPhantomToBase = profile => ({
  profileID: profile.Name,
  deliveryCountry: profile.Country,
  deliveryAddress: profile.Shipping.Address,
  deliveryCity: profile.Shipping.City,
  deliveryFirstName: profile.Shipping.FirstName,
  deliveryLastName: profile.Shipping.LastName,
  deliveryRegion: profile.Shipping.State,
  deliveryZip: profile.Shipping.Zip,
  deliveryApt: profile.Shipping.Apt,
  billingZip: profile.Billing.Zip,
  billingCountry: profile.Country,
  billingAddress: profile.Billing.Address,
  billingCity: profile.Billing.City,
  billingFirstName: profile.Billing.FirstName,
  billingLastName: profile.Billing.LastName,
  billingRegion: profile.Billing.State,
  billingApt: profile.Billing.Apt,
  phone: profile.Phone,
  card: {
    paymentCardholdersName: '',
    cardNumber: profile.CCNumber,
    expMonth: profile.ExpMonth,
    expYear: profile.ExpYear,
    cvv: profile.CVV
  },
  email: profile.Email,
  password: '',
  sameDeliveryBillingBool: profile.Same,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertDasheToBase = profile => ({
  profileID: profile.profileName,
  deliveryCountry: profile.shipping.country,
  deliveryAddress: profile.shipping.address,
  deliveryCity: profile.shipping.city,
  deliveryFirstName: profile.shipping.firstName,
  deliveryLastName: profile.shipping.lastName,
  deliveryRegion: profile.shipping.state,
  deliveryZip: profile.shipping.zipCode,
  deliveryApt: profile.shipping.apt,
  billingZip: profile.billing.zipcode,
  billingCountry: profile.billing.country,
  billingAddress: profile.billing.address,
  billingCity: profile.billing.city,
  billingFirstName: profile.billing.firstName,
  billingLastName: profile.billing.lastName,
  billingRegion: profile.billing.state,
  billingApt: profile.billing.apt,
  phone: profile.billing.phone,
  card: {
    paymentCardholdersName: profile.holder,
    cardNumber: profile.card.number,
    expMonth: profile.card.month,
    expYear: profile.card.year,
    cvv: profile.card.cvv
  },
  email: profile.email,
  password: '',
  sameDeliveryBillingBool: profile.billingMatch,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertHasteyToBase = profile => ({
  // eslint-disable-next-line no-underscore-dangle
  profileID: profile.__profile__name,
  deliveryCountry: profile.country,
  deliveryAddress: profile.address,
  deliveryCity: profile.city,
  deliveryFirstName: profile.name.split(' ')[0],
  deliveryLastName: profile.name.split(' ')[1],
  deliveryRegion: profile.state,
  deliveryZip: profile.zip,
  deliveryApt: profile.address_2,
  billingZip: profile.zip,
  billingCountry: profile.country,
  billingAddress: profile.address,
  billingCity: profile.city,
  billingFirstName: profile.name.split(' ')[0],
  billingLastName: profile.name.split(' ')[1],
  billingRegion: profile.state,
  billingApt: profile.address_2,
  email: profile.email,
  password: '',
  phone: profile.tel,
  card: {
    paymentCardholdersName: profile.name,
    cardNumber: profile.cc_number,
    expMonth: profile.cc_month,
    expYear: profile.cc_year,
    cvv: profile.cc_cvv
  },
  sameDeliveryBillingBool: false,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertKodaiToBase = profile => ({
  profileID: profile.profileName,
  deliveryCountry: profile.region,
  deliveryAddress: profile.deliveryAddress.address,
  deliveryCity: profile.deliveryAddress.city,
  deliveryFirstName: profile.deliveryAddress.firstName,
  deliveryLastName: profile.deliveryAddress.lastName,
  deliveryRegion: profile.deliveryAddress.state,
  deliveryZip: profile.deliveryAddress.zipCode,
  deliveryApt: profile.deliveryAddress.apt,
  billingZip: profile.billingAddress.zipCode,
  billingCountry: profile.region,
  billingAddress: profile.billingAddress.address,
  billingCity: profile.billingAddress.city,
  billingFirstName: profile.billingAddress.firstName,
  billingLastName: profile.billingAddress.lastName,
  billingRegion: profile.billingAddress.state,
  billingApt: profile.billingAddress.apt,
  phone: profile.billingAddress.phoneNumber,
  card: {
    paymentCardholdersName: profile.paymentDetails.cardHolder,
    cardNumber: profile.paymentDetails.paymentCardnumber,
    expMonth: profile.paymentDetails.expirationDate.split('/')[0],
    expYear: `20${profile.paymentDetails.expirationDate.split('/')[1]}`,
    cvv: profile.paymentDetails.paymentCVV
  },
  email: profile.paymentDetails.emailAddress,
  password: '',
  sameDeliveryBillingBool:
    profile.miscellaneousInformation.deliverySameAsBilling,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertNsbToBase = profile => ({
  profileID: profile.name,
  deliveryCountry: shortToLongCountries[profile.shipping.country] || '',
  deliveryAddress: profile.shipping.address,
  deliveryCity: profile.shipping.city,
  deliveryFirstName: profile.shipping.firstname,
  deliveryLastName: profile.shipping.lastname,
  deliveryRegion: shortToLongStates[profile.shipping.state],
  deliveryZip: profile.shipping.zip,
  deliveryApt: profile.shipping.address2,
  billingZip: profile.shipping.zip,
  billingCountry: shortToLongCountries[profile.shipping.country] || '',
  billingAddress: profile.shipping.address,
  billingCity: profile.shipping.city,
  billingFirstName: profile.shipping.firstname,
  billingLastName: profile.shipping.lastname,
  billingRegion: shortToLongStates[profile.shipping.state] || '',
  billingApt: profile.shipping.address2,
  card: {
    paymentCardholdersName: profile.cc.name,
    cardNumber: profile.cc.number.split(' ').join(''),
    expMonth: profile.cc.expiry.split('/')[0].trim(),
    expYear: `20${profile.cc.expiry.split('/')[1].trim()}`,
    cvv: profile.cc.cvc
  },
  email: profile.email,
  password: '',
  phone: profile.phone,
  sameDeliveryBillingBool: profile.billingSame,
  oneCheckoutBool: profile.checkoutLimit > 0,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertSoleAioToBase = profile => ({
  profileID: profile.ProfileName,
  deliveryCountry: profile.ShippingCountry,
  deliveryAddress: profile.ShippingAddress1,
  deliveryCity: profile.ShippingCity,
  deliveryFirstName: profile.ShippingFirstName,
  deliveryLastName: profile.ShippingLastName,
  deliveryRegion: shortToLongStates[profile.ShippingState],
  deliveryZip: profile.ShippingZip,
  deliveryApt: profile.ShippingAddress2,
  billingZip: profile.BillingZip,
  billingCountry: profile.BillingCountry,
  billingAddress: profile.BillingAddress1,
  billingCity: profile.BillingCity,
  billingFirstName: profile.BillingFirstName,
  billingLastName: profile.BillingLastName,
  billingRegion: shortToLongStates[profile.BillingState],
  billingApt: profile.BillingAddress2,
  card: {
    paymentCardholdersName: profile.CardName,
    cardNumber: profile.paymentCardnumber,
    expMonth: profile.paymentCardExpiryMonth,
    expYear: `20${profile.paymentCardExpiryYear}`,
    cvv: profile.paymentCVV
  },
  email: profile.Email,
  password: '',
  phone: profile.Phone,
  sameDeliveryBillingBool: profile.UseBilling,
  oneCheckoutBool: profile.CheckoutLimit === '1 checkout per site',
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertCSVToBase = profile => ({
  profileID: profile.profileID,
  deliveryCountry: profile.deliveryCountry,
  deliveryAddress: profile.deliveryAddress,
  deliveryCity: profile.deliveryCity,
  deliveryFirstName: profile.deliveryFirstName,
  deliveryLastName: profile.deliveryLastName,
  deliveryRegion: profile.deliveryRegion,
  deliveryZip: profile.deliveryZip,
  deliveryApt: profile.deliveryApt,
  billingZip: profile.billingZip,
  billingCountry: profile.billingCountry,
  billingAddress: profile.billingAddress,
  billingCity: profile.billingCity,
  billingFirstName: profile.billingFirstName,
  billingLastName: profile.billingLastName,
  billingRegion: profile.billingRegion,
  billingApt: profile.billingApt,
  card: {
    paymentCardholdersName: `${profile.billingFirstName} ${profile.billingLastName}`,
    cardNumber: profile.paymentCardnumber,
    expMonth: profile.paymentexpMonth,
    expYear: profile.paymentexpYear,
    cvv: profile.paymentCVV
  },
  email: profile.paymentEmail,
  password: profile.password,
  phone: profile.phoneNumber,
  sameDeliveryBillingBool: false,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertTKSToBase = profile => ({
  profileID: profile.ProfileName,
  deliveryCountry: profile.ShippingCountry,
  deliveryAddress: profile.ShippingAddress1,
  deliveryCity: profile.ShippingCity,
  deliveryFirstName: profile.ShippingFirstName,
  deliveryLastName: profile.ShippingLastName,
  deliveryRegion: shortToLongStates[profile.ShippingState],
  deliveryZip: profile.ShippingZip,
  deliveryApt: profile.ShippingAddress2,
  billingZip: profile.BillingZip,
  billingCountry: profile.BillingCountry,
  billingAddress: profile.BillingAddress1,
  billingCity: profile.BillingCity,
  billingFirstName: profile.BillingFirstName,
  billingLastName: profile.BillingLastName,
  billingRegion: shortToLongStates[profile.BillingState],
  billingApt: profile.BillingAddress2,
  card: {
    paymentCardholdersName: profile.CardName,
    cardNumber: profile.paymentCardnumber,
    expMonth: profile.paymentCardExpiryMonth,
    expYear: `20${profile.paymentCardExpiryYear}`,
    cvv: profile.paymentCVV
  },
  email: profile.Email,
  password: '',
  phone: profile.Phone,
  sameDeliveryBillingBool: false,
  oneCheckoutBool: false,
  randomNameBool: false,
  randomPhoneNumberBool: false,
  useCatchallBool: false,
  jigAddressesBool: false,
  fourCharPrefixBool: false
});

export const convertNeutrinoToBase = profile => ({
  ...profile
});

export const convertToBase = (bot, profile) => {
  switch (bot) {
    case 'Cybersole':
      return convertCybersoleToBase(profile);
    case 'Project Destroyer':
      return convertProjectDestroyerToBase(profile);
    case 'Ghost':
      return convertGhostToBase(profile);
    case 'Phantom':
      return convertPhantomToBase(profile);
    case 'EVE AIO':
      return convertEveaioToBase(profile);
    case 'Dashe':
      return convertDasheToBase(profile);
    case 'Hastey':
      return convertHasteyToBase(profile);
    case 'NSB':
      return convertNsbToBase(profile);
    case 'SOLE AIO':
      return convertSoleAioToBase(profile);
    case 'Balko':
      return convertBalkoToBase(profile);
    case 'Kodai':
      return convertKodaiToBase(profile);
    case 'TKS':
      return convertTKSToBase(profile);
    case 'Neutrino':
      return convertNeutrinoToBase(profile);
    case 'CSV':
      return convertCSVToBase(profile);
    default:
      return undefined;
  }
};
