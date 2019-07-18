import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { ToastProvider } from 'react-toast-notifications';
import routes from './constants/routes';
import App from './containers/App';
import Home from './screens/Home';
import Captcha from './screens/Captcha';
import Login from './screens/Login';
import {
  getAuth,
  setUserMachineIDOnFirstLoad,
  checkIfUserMachineIDMatches
} from './utils/firebase';
import { NeutrinoToast } from './components/Toast';

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorised: false,
      message: '',
      uid: ''
    };
  }

  componentDidMount() {
    this.checkAuthChange();
  }

  setAuthAndMessage = (authorised, message) => {
    this.setState({
      authorised,
      message
    });
  };

  checkUserAuth = async uid => {
    const machineIDStatus = await checkIfUserMachineIDMatches(uid);
    this.setState({
      authorised: machineIDStatus.authorised,
      message: machineIDStatus.message,
      uid
    });
  };

  checkAuthChange() {
    const auth = getAuth();
    auth.onAuthStateChanged(async user => {
      if (user) {
        await setUserMachineIDOnFirstLoad(user.uid);
        this.checkUserAuth(user.uid);
      } else {
        this.setState({
          authorised: false,
          message: ''
        });
      }
    });
  }

  render() {
    const { authorised, message, uid } = this.state;
    return (
      <ToastProvider
        autoDismissTimeout={5000}
        component
        components={{ Toast: NeutrinoToast }}
      >
        <App>
          <Switch>
            {authorised ? (
              <Route
                path={routes.ROOT}
                render={routeProps => (
                  <Home
                    checkUserAuth={this.checkUserAuth}
                    uid={uid}
                    {...routeProps}
                  />
                )}
              />
            ) : (
              <Route
                path={routes.ROOT}
                render={() => (
                  <Login
                    authorised={authorised}
                    message={message}
                    setAuthAndMessage={this.setAuthAndMessage}
                  />
                )}
              />
            )}
            <Route path={routes.CAPTCHA} component={Captcha} />
          </Switch>
        </App>
      </ToastProvider>
    );
  }
}
