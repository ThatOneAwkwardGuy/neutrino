export const ADD_PROXY = 'ADD_PROXY';
export const CLEAR_ACCOUNT_PROXIES = 'CLEAR_ACCOUNT_PROXIES';
export const CLEAR_PROXIES = 'CLEAR_PROXIES';

export const addProxy = proxy => ({
  type: ADD_PROXY,
  proxy
});

export const clearAccountProxy = providerAccountID => ({
  type: CLEAR_ACCOUNT_PROXIES,
  providerAccountID
});

export const clearProxies = () => ({
  type: CLEAR_PROXIES
});
