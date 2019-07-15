import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { ToastProvider } from 'react-toast-notifications';
import routes from './constants/routes';
import App from './containers/App';
import Home from './screens/Home';
import Captcha from './screens/Captcha';
import Login from './screens/Login';
import { getAuth } from './utils/firebase';
import { NeutrinoToast } from './components/Toast';

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorised: false
    };
  }

  componentDidMount() {
    this.checkAuthChange();
  }

  checkAuthChange() {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      this.setState({
        authorised: !!user
      });
    });
  }

  render() {
    const { authorised } = this.state;
    return (
      <ToastProvider
        autoDismissTimeout={5000}
        component
        components={{ Toast: NeutrinoToast }}
      >
        <App>
          <Switch>
            {authorised ? (
              <Route path={routes.ROOT} component={Home} />
            ) : (
              <Route path={routes.ROOT} component={Login} />
            )}
            <Route path={routes.CAPTCHA} component={Captcha} />
          </Switch>
        </App>
      </ToastProvider>
    );
  }
}
