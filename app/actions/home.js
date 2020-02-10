const log = require('electron-log');
const { getGlobal } = require('electron').remote;

const trackEvent = getGlobal('trackEvent');

export const INCREMENT_RAFFLES = 'INCREMENT_RAFFLES';
export const INCREMENT_PROXIES = 'INCREMENT_PROXIES';
export const INCREMENT_ACCOUNTS = 'INCREMENT_ACCOUNTS';

export const incrementRaffles = (raffleInfo = {}) => {
  try {
    trackEvent('Raffle Bot', 'Raffle Entry', raffleInfo.url);
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_RAFFLES
  };
};

export const incrementProxies = proxyInfo => {
  try {
    trackEvent('Proxy Creator', 'Proxy Creation', proxyInfo.provider);
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_PROXIES
  };
};

export const incrementAccounts = accountInfo => {
  try {
    trackEvent('Account Creator', 'Account Creation', accountInfo.site);
  } catch (e) {
    log.error(e);
  }
  return {
    type: INCREMENT_ACCOUNTS
  };
};
