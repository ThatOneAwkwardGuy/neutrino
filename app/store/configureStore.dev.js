import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { persistCombineReducers, createMigrate } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import createRootReducer from '../reducers';
import * as settingsActions from '../actions/settings';
import type { settingsStateType } from '../reducers/types';

const Store = require('electron-store');

const electronStore = new Store();
const persistConfig = {
  key: 'neutrino-store-dev',
  storage: createElectronStorage({ electronStore }),
  version: 1,
  migrate: createMigrate({ 1: state => initialState }, { debug: false })
};

const history = createHashHistory();

const rootReducer = createRootReducer(history);

const persistedReducer = persistCombineReducers(persistConfig, rootReducer);

const configureStore = (initialState?: settingsStateType) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...settingsActions,
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(persistedReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
};

export default { configureStore, history };
