import { createStore } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import rootReducer from './reducers/index';
const Store = require('electron-store');

export default function configureStore() {
  const electronStore = new Store();
  const persistConfig = {
    key: 'dkdw',
    storage: createElectronStorage({ electronStore })
  };
  const persistedReducer = persistCombineReducers(persistConfig, rootReducer);
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  return { store, persistor };
}
