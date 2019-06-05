import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import routes from './routes';
import configureStore from './store';
import '../node_modules/font-awesome/css/font-awesome.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './fonts/stylesheet.css';
import './app.global.css';
import './react-datetime.css';
import 'react-toggle/style.css';
import 'react-table/react-table.css';
import { PersistGate } from 'redux-persist/integration/react';

const { store, persistor } = configureStore();
const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {routes}
    </PersistGate>
  </Provider>,
  rootElement
);
