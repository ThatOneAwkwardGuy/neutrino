import {
  shortToLongCountries,
  shortToLongStates
} from '../../constants/constants';

export const convertCybersoleProfileToBase = profile => ({
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
});
export const convertProjectDestroyerProfileToBase = profile => ({
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
});
export const convertGhostProfileToBase = profile => ({
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
  sameAsDelivery: profile.Same,
  oneCheckout: false
});
export const convertBalkoProfileToBase = profile => ({
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
  sameAsDelivery: false,
  oneCheckout: false
});
export const convertEveaioProfileToBase = profile => ({
  profileID: profile.ProfileName,
  deliveryCountry: shortToLongCountries[profile.ShippingCountryCode] || '',
  deliveryAddress: profile.ShippingAddressLine1,
  deliveryCity: profile.ShippingCity,
  deliveryFirstName: profile.ShippingFirstName,
  deliveryLastName: profile.ShippingLastName,
  deliveryProvince: shortToLongStates[profile.ShippingState] || '',
  deliveryZip: profile.ShippingZip,
  deliveryAptorSuite: profile.ShippingAddressLine2,
  billingZip: profile.BillingZip,
  billingCountry: shortToLongCountries[profile.BillingCountryCode] || '',
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
});
export const convertPhantomProfileToBase = profile => ({
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
  sameAsDelivery: profile.Same,
  oneCheckout: false
});
export const convertDasheProfileToBase = profile => ({
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
  sameAsDelivery: profile.billingMatch,
  oneCheckout: false
});
export const convertHasteyProfileToBase = profile => ({
  // eslint-disable-next-line no-underscore-dangle
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
});
export const convertKodaiProfileToBase = profile => ({
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
  paymentCardExpiryYear: `20${
    profile.paymentDetails.expirationDate.split('/')[1]
  }`,
  paymentCVV: profile.paymentDetails.paymentCVV,
  email: profile.paymentDetails.emailAddress,
  sameAsDelivery: profile.miscellaneousInformation.deliverySameAsBilling,
  oneCheckout: false
});
export const convertNsbProfileToBase = profile => ({
  profileID: profile.name,
  deliveryCountry: shortToLongCountries[profile.shipping.country] || '',
  deliveryAddress: profile.shipping.address,
  deliveryCity: profile.shipping.city,
  deliveryFirstName: profile.shipping.firstname,
  deliveryLastName: profile.shipping.lastname,
  deliveryProvince: shortToLongStates[profile.shipping.state],
  deliveryZip: profile.shipping.zip,
  deliveryAptorSuite: profile.shipping.address2,
  billingZip: profile.shipping.zip,
  billingCountry: shortToLongCountries[profile.shipping.country] || '',
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
  oneCheckout: profile.checkoutLimit > 0
});
export const convertSoleAioProfileToBase = profile => ({
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
});
