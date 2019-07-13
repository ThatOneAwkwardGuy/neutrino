export const ADD_PROXY_PROVIDER_ACCOUNT = 'ADD_PROXY_PROVIDER_ACCOUNT';
export const REMOVE_PROXY_PROVIDER_ACCOUNT = 'REMOVE_PROXY_PROVIDER_ACCOUNT';

export function addProxyProviderAccount(providerAccount) {
  return {
    type: ADD_PROXY_PROVIDER_ACCOUNT,
    providerAccount
  };
}

export function removeProxyProviderAccount(provider, index) {
  return {
    type: REMOVE_PROXY_PROVIDER_ACCOUNT,
    provider,
    index
  };
}
