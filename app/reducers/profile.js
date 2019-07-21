import {
  UPDATE_PROFILE_ATTRIBUTE,
  CLEAR_PROFILE_ATTRIBUTES,
  UPDATE_PROFILE
} from '../actions/profile';

import type { profileStateType, Action } from './types';

export default function profile(
  state: profileStateType = {
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
    billingZip: '',
    catchallEmail: ''
  },
  action: Action
) {
  switch (action.type) {
    case UPDATE_PROFILE_ATTRIBUTE: {
      const updateProfileAttributeState = { ...state };
      updateProfileAttributeState[action.attributeName] = action.value;
      return updateProfileAttributeState;
    }
    case CLEAR_PROFILE_ATTRIBUTES:
      return {
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
        billingZip: '',
        catchallEmail: ''
      };
    case UPDATE_PROFILE: {
      const updateProfileState = { ...state, ...action.profile };
      return updateProfileState;
    }
    default:
      return state;
  }
}
