import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import neutrinoSettingsReducer from './settings';
import neutrinoAccountsReducer from './accounts';
import neutrinoActivityReducer from './activity';
import neutrinoProfileReducer from './profile';
export default history =>
  combineReducers({
    router: connectRouter(history),
    neutrinoSettingsReducer,
    neutrinoAccountsReducer,
    neutrinoActivityReducer,
    neutrinoProfileReducer
  });
