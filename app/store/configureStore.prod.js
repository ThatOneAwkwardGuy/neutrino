// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { persistCombineReducers } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import createRootReducer from '../reducers';
import type { settingsStateType } from '../reducers/types';

const Store = require('electron-store');

const electronStore = new Store();
const persistConfig = {
  key: 'neutrino-store',
  storage: createElectronStorage({ electronStore })
};

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const persistedReducer = persistCombineReducers(persistConfig, rootReducer);

const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: settingsStateType) {
  return createStore(persistedReducer, initialState, enhancer);
}

export default { configureStore, history };
