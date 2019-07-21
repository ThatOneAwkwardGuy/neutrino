// @flow
import { connectRouter } from 'connected-react-router';
import settings from './settings';
import accounts from './accounts';
import activities from './activities';

export default function createRootReducer(history: History) {
  return {
    router: connectRouter(history),
    settings,
    accounts,
    activities
  };
}
