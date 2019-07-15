// @flow
import {
  ADD_PROXY_PROVIDER_ACCOUNT,
  REMOVE_PROXY_PROVIDER_ACCOUNT
} from '../actions/settings';

import type { settingsStateType, Action } from './types';

export default function settings(
  state: settingsStateType = {
    proxyAccounts: {
      google: [],
      digitalocean: [],
      vultr: []
    }
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
    default:
      return state;
  }
}
