// @flow
import {
  ADD_PROXY_PROVIDER_ACCOUNT,
  REMOVE_PROXY_PROVIDER_ACCOUNT,
  SET_ROOT_SETTING_VALUE,
  UPDATE_UPDATE_STATUS
} from '../actions/settings';

import type { settingsStateType, Action } from './types';

export default function settings(
  state: settingsStateType = {
    proxyAccounts: {
      google: [],
      digitalocean: [],
      vultr: [],
      linode: [],
      aws: []
    },
    oneClickCheckTiming: '60',
    activityDelayMin: '60000',
    activityDelayMax: '120000',
    parallelRaffleEntries: '1',
    raffleEntryDelay: '35000',
    showAcitivtyWindows: false,
    activityGoogleSearch: true,
    activityGoogleNews: true,
    activityGoogleShopping: true,
    activityYoutube: true,
    theme: 'Neutrino',
    update: {
      status: '',
      releaseDate: '',
      lastChecked: new Date().getTime(),
      changelog: '',
      version: ''
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
    case SET_ROOT_SETTING_VALUE: {
      const changeRootSetting = { ...state };
      changeRootSetting[action.key] = action.value;
      if (action.key === 'theme') {
        changeTheme(action.value);
      }
      return changeRootSetting;
    }
    case UPDATE_UPDATE_STATUS: {
      const updateUpdateStatusState = { ...state };
      const { update } = updateUpdateStatusState.update;
      updateUpdateStatusState.update = { ...update, ...action.update };
      return updateUpdateStatusState;
    }
    default:
      return state;
  }
}

export const changeTheme = themeName => {
  document.getElementById('neutrinoHTML').className = `theme-${themeName}`;
};
