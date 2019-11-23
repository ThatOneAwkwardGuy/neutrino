import { getAnalytics } from '../utils/firebase';

const log = require('electron-log');

export const INCREMENT_RAFFLES = 'INCREMENT_RAFFLES';
export const INCREMENT_PROXIES = 'INCREMENT_PROXIES';
export const INCREMENT_ACCOUNTS = 'INCREMENT_ACCOUNTS';

const analytics = getAnalytics();

export const incrementRaffles = (raffleInfo = {}) => {
  try {
    analytics.logEvent('Raffle Entry', {
      ...raffleInfo
    });
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_RAFFLES
  };
};

export const incrementProxies = proxyInfo => {
  try {
    analytics.logEvent('Proxy Creation', {
      ...proxyInfo
    });
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_PROXIES
  };
};

export const incrementAccounts = accountInfo => {
  try {
    analytics.logEvent('Account Creation', {
      ...accountInfo
    });
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_ACCOUNTS
  };
};
