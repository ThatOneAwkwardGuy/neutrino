export const ADD_PROXY_PROVIDER_ACCOUNT = 'ADD_PROXY_PROVIDER_ACCOUNT';
export const REMOVE_PROXY_PROVIDER_ACCOUNT = 'REMOVE_PROXY_PROVIDER_ACCOUNT';

export const addProxyProviderAccount = providerAccount => ({
  type: ADD_PROXY_PROVIDER_ACCOUNT,
  providerAccount
});

export const removeProxyProviderAccount = (provider, index) => ({
  type: REMOVE_PROXY_PROVIDER_ACCOUNT,
  provider,
  index
});
