// @flow
import { connectRouter } from 'connected-react-router';
import settings from './settings';
import accounts from './accounts';
import activities from './activities';
import profile from './profile';
import home from './home';
import proxies from './proxies';

export default function createRootReducer(history: History) {
  return {
    router: connectRouter(history),
    settings,
    accounts,
    activities,
    profile,
    home,
    proxies
  };
}
