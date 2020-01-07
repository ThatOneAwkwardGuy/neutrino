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
import { getExternalAuth } from './utils/services';
import { NeutrinoToast } from './components/Toast';

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorised: false,
      raffleBot: false,
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
    try {
      switch (uid.split(/-(.+)/)[0]) {
        case 'blazeUnlimited':
          await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
          break;
        default: {
          const machineIDStatus = await checkIfUserMachineIDMatches(uid);
          this.setState({
            authorised: machineIDStatus.authorised,
            raffleBot: machineIDStatus.raffleBot,
            message: machineIDStatus.message,
            uid
          });
        }
      }
    } catch (error) {
      this.setState({
        authorised: false,
        message: 'There wase an error authorising your access to Neutrino.',
        uid
      });
      const auth = getAuth();
      auth.signOut();
    }
  };

  checkAuthChange() {
    const auth = getAuth();
    auth.onAuthStateChanged(async user => {
      if (user && user.email !== null) {
        await setUserMachineIDOnFirstLoad(user.uid);
        this.checkUserAuth(user.uid);
      } else if (user && user.email === null) {
        this.setState({
          uid: user.uid,
          authorised: true,
          raffleBot: true
        });
      } else {
        this.setState({
          authorised: false
        });
      }
    });
  }

  render() {
    const { authorised, message, uid, raffleBot } = this.state;
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
                    raffleBot={raffleBot}
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
