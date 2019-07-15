// @flow
import { connectRouter } from 'connected-react-router';
import settings from './settings';
import accounts from './accounts';

export default function createRootReducer(history: History) {
  return {
    router: connectRouter(history),
    settings,
    accounts
  };
}
