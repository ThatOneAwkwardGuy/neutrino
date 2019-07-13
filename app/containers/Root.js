// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { PersistGate } from 'redux-persist/integration/react';
import PropTypes from 'prop-types';
import type { Store } from '../reducers/types';
import Routes from '../Routes';

type Props = {
  store: Store,
  history: {}
};

class Root extends Component<Props> {
  render() {
    const { store, history, persistedStore } = this.props;
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistedStore}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    );
  }
}

Root.propTypes = {
  persistedStore: PropTypes.objectOf(PropTypes.any).isRequired
};

export default Root;
