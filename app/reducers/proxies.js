import {
  ADD_PROXY,
  CLEAR_ACCOUNT_PROXIES,
  CLEAR_PROXIES
} from '../actions/proxies';

import type { proxyStateType, Action } from './types';

export default function proxies(
  state: proxyStateType = { proxies: [] },
  action: Action
) {
  switch (action.type) {
    case ADD_PROXY: {
      const addProxyState = { ...state };
      addProxyState.proxies.push(action.proxy);
      return addProxyState;
    }
    case CLEAR_ACCOUNT_PROXIES: {
      const clearAccountProxyState = { ...state };
      const filteredProxies = clearAccountProxyState.proxies.filter(
        proxy => proxy.providerAccountID !== action.providerAccountID
      );
      clearAccountProxyState.proxies = filteredProxies;
      return clearAccountProxyState;
    }
    case CLEAR_PROXIES: {
      const clearProxiesState = { ...state };
      clearProxiesState.proxies = [];
      return clearProxiesState;
    }
    default:
      return state;
  }
}
