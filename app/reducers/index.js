import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import neutrinoSettingsReducer from './settings';
import neutrinoAccountsReducer from './accounts';

export default history =>
  combineReducers({
    router: connectRouter(history),
    neutrinoSettingsReducer,
    neutrinoAccountsReducer
  });
