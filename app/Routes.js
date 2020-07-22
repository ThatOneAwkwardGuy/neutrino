import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { ToastProvider } from 'react-toast-notifications';
import PropTypes from 'prop-types';
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

const { getGlobal } = require('electron').remote;

const trackEvent = getGlobal('trackEvent');
const setAnalyticsUserID = getGlobal('setAnalyticsUserID');

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastChecked: 0,
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
    const { lastChecked } = this.state;
    if (lastChecked === 0 || Date.now() - lastChecked > 300000) {
      this.setState({ lastChecked: Date.now() });
      try {
        switch (uid.split(/-(.+)/)[0]) {
          case 'blazeUnlimited':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'gloryNotify':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'soleNotify':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'noctua':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'globalHeat':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'SSX':
            await getExternalAuth(uid.split(/-(.+)/)[0], uid.split(/-(.+)/)[1]);
            break;
          case 'juicedSnkrs':
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
        try {
          setAnalyticsUserID(uid);
          trackEvent('Login', 'Login', uid);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        this.setState({
          authorised: false,
          message: 'There was an error authorising your access to Neutrino.',
          uid
        });
        const auth = getAuth();
        auth.signOut();
      }
    }
  };

  checkAuthChange() {
    const auth = getAuth();
    auth.onAuthStateChanged(async user => {
      if (user !== null && user.email !== null) {
        await setUserMachineIDOnFirstLoad(user.uid);
        this.checkUserAuth(user.uid);
      } else if (user !== null && user.email === null) {
        this.setState({
          uid: user.uid,
          authorised: true,
          raffleBot: true
        });
      } else {
        this.setState({
          authorised: false,
          lastChecked: 0
        });
      }
    });
  }

  render() {
    const { authorised, message, uid, raffleBot } = this.state;
    const { setKeyInSetting } = this.props;
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
                    setKeyInSetting={setKeyInSetting}
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

Routes.propTypes = {
  setKeyInSetting: PropTypes.func.isRequired
};
