// @flow
import {
  ADD_PROXY_PROVIDER_ACCOUNT,
  REMOVE_PROXY_PROVIDER_ACCOUNT,
  SET_ROOT_SETTING_VALUE
} from '../actions/settings';

import type { settingsStateType, Action } from './types';

export default function settings(
  state: settingsStateType = {
    proxyAccounts: {
      google: [],
      digitalocean: [],
      vultr: []
    },
    activityDelayMin: '60000',
    activityDelayMax: '120000',
    showAcitivtyWindows: false,
    activityGoogleSearch: true,
    activityGoogleNews: true,
    activityGoogleShopping: true,
    activityYoutube: true
  },
  action: Action
) {
  switch (action.type) {
    case ADD_PROXY_PROVIDER_ACCOUNT: {
      const addProxyProviderAccountState = { ...state };
      addProxyProviderAccountState.proxyAccounts[
        action.providerAccount.provider
      ].push(action.providerAccount);
      return addProxyProviderAccountState;
    }
    case REMOVE_PROXY_PROVIDER_ACCOUNT: {
      const removeProxyProviderAccountState = { ...state };
      removeProxyProviderAccountState.proxyAccounts[
        action.provider
      ] = removeProxyProviderAccountState.proxyAccounts[action.provider].filter(
        (account, index) => index !== action.index
      );
      return removeProxyProviderAccountState;
    }
    case SET_ROOT_SETTING_VALUE: {
      const changeRootSetting = { ...state };
      changeRootSetting[action.key] = action.value;
      return changeRootSetting;
    }
    default:
      return state;
  }
}
