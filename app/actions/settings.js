export const ADD_PROXY_PROVIDER_ACCOUNT = 'ADD_PROXY_PROVIDER_ACCOUNT';
export const REMOVE_PROXY_PROVIDER_ACCOUNT = 'REMOVE_PROXY_PROVIDER_ACCOUNT';
export const SET_ROOT_SETTING_VALUE = 'SET_ROOT_SETTING_VALUE';
export const UPDATE_UPDATE_STATUS = 'UPDATE_UPDATE_STATUS';

export const addProxyProviderAccount = providerAccount => ({
  type: ADD_PROXY_PROVIDER_ACCOUNT,
  providerAccount
});

export const removeProxyProviderAccount = (provider, index) => ({
  type: REMOVE_PROXY_PROVIDER_ACCOUNT,
  provider,
  index
});

export const setKeyInSetting = (key, value) => ({
  type: SET_ROOT_SETTING_VALUE,
  key,
  value
});

export const updateUpdateStatus = update => ({
  type: UPDATE_UPDATE_STATUS,
  update
});
