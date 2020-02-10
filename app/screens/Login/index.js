import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  Form,
  FormGroup,
  Label,
  Button
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import BarLoader from 'react-spinners/BarLoader';
import PropTypes from 'prop-types';
import { getAuth } from '../../utils/firebase';
import { getExternalAuth } from '../../utils/services';
import Header from '../../components/Header';
import neutrinoTextLogo from '../../images/textLogo.svg';
import blazeUnlimitedLogo from '../../images/blazeUnlimited.png';
import gloryNotifyLogo from '../../images/gloryNotify.png';
import soleNotifyLogo from '../../images/soleNotify.png';
import globalHeatLogo from '../../images/globalHeat.png';

const { BrowserWindow } = require('electron').remote;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      pass: '',
      key: '',
      showLoader: false,
      authServer: 'neutrino'
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'authServer') {
      const { setAuthAndMessage } = this.props;
      setAuthAndMessage(false, '');
    }
  };

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      this.login();
    }
  };

  returnAuthServerImage = () => {
    const { authServer } = this.state;
    let authServerImage = null;
    switch (authServer) {
      case 'blazeUnlimited':
        authServerImage = blazeUnlimitedLogo;
        break;
      case 'gloryNotify':
        authServerImage = gloryNotifyLogo;
        break;
      case 'soleNotify':
        authServerImage = soleNotifyLogo;
        break;
      case 'globalHeat':
        authServerImage = globalHeatLogo;
        break;
      default:
        break;
    }
    if (authServerImage !== null) {
      return (
        <FormGroup className="text-center">
          <img
            alt="Auth Server Text Logo"
            id="authServerLogo"
            draggable="false"
            className="my-3"
            src={authServerImage}
          />
        </FormGroup>
      );
    }
  };

  loginWithFirebase = async () => {
    const { email, pass } = this.state;
    const { setAuthAndMessage } = this.props;
    this.setState({ showLoader: true });
    setAuthAndMessage(false, '');
    try {
      const auth = getAuth();
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (error) {
      let message = 'There was an error logging you in.';
      if (error.code === 'auth/wrong-password') {
        message =
          'The password you have entered is incorrect. If you wish to reset your password you can do so on neutrinotools.app';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email you have entered is formatted incorrectly.';
      }
      setAuthAndMessage(false, message);
    } finally {
      this.setState({ showLoader: false });
    }
  };

  loginWithExternalAuth = async () => {
    const { key, authServer } = this.state;
    const { setAuthAndMessage } = this.props;
    this.setState({ showLoader: true });
    setAuthAndMessage(false, '');
    try {
      const authResponse = await getExternalAuth(authServer, key);
      const auth = getAuth();
      auth.signInWithCustomToken(authResponse.token);
    } catch (error) {
      console.log(error);
      const message = `There was an error logging you in: ${error.error.status}`;
      setAuthAndMessage(false, message);
    } finally {
      this.setState({ showLoader: false });
    }
  };

  login = async () => {
    const { authServer } = this.state;
    switch (authServer) {
      case 'neutrino': {
        this.loginWithFirebase();
        break;
      }
      case 'gloryNotify': {
        const code = await this.loginWithDiscord();
        this.setState(
          {
            key: code
          },
          () => {
            this.loginWithExternalAuth();
          }
        );
        break;
      }
      case 'soleNotify': {
        const code = await this.loginWithDiscord();
        this.setState(
          {
            key: code
          },
          () => {
            this.loginWithExternalAuth();
          }
        );
        break;
      }
      case 'globalHeat': {
        const code = await this.loginWithDiscord();
        this.setState(
          {
            key: code
          },
          () => {
            this.loginWithExternalAuth();
          }
        );
        break;
      }
      default:
        this.loginWithExternalAuth();
        break;
    }
  };

  loginWithDiscord = async () => {
    const win = new BrowserWindow({
      width: 500,
      height: 650,
      show: true,
      frame: true,
      resizable: true,
      focusable: true,
      minimizable: true,
      closable: true,
      allowRunningInsecureContent: true,
      webPreferences: {
        webviewTag: true,
        allowRunningInsecureContent: true,
        nodeIntegration: false,
        webSecurity: false
      }
    });
    const winWebcontents = win.webContents;
    return new Promise((resolve, reject) => {
      win.loadURL(
        'https://discordapp.com/api/oauth2/authorize?client_id=575360564767752194&redirect_uri=https%3A%2F%2Fneutrinotools.app&response_type=code&scope=identify%20email%20guilds'
      );
      winWebcontents.on('will-navigate', async () => {
        const windowLocation = await winWebcontents.executeJavaScript(
          'window.location.search'
        );
        if (windowLocation.includes('code=')) {
          const urlParams = new URLSearchParams(windowLocation);
          const code = urlParams.get('code');
          resolve(code);
        } else {
          reject();
        }
        win.close();
      });
    });
  };

  returnAuthServerForm = () => {
    const { showLoader, authServer } = this.state;
    if (authServer === 'neutrino') {
      return (
        <div>
          <FormGroup className="my-4">
            <Label className="boldLabel">Email</Label>
            <Input
              name="email"
              type="text"
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
            />
          </FormGroup>
          <FormGroup className="my-4">
            <Label className="boldLabel">Password</Label>
            <Input
              name="pass"
              type="password"
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
            />
          </FormGroup>
          <FormGroup>
            {showLoader ? (
              <BarLoader width={100} widthUnit="%" color="#2745fb" />
            ) : null}
            <Button className="neutrinoButton my-4" onClick={this.login}>
              Login
            </Button>
          </FormGroup>
        </div>
      );
    }

    if (authServer === 'blazeUnlimited') {
      return (
        <div>
          <FormGroup className="my-4">
            <Label className="boldLabel">Key</Label>
            <Input
              name="key"
              type="text"
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
            />
          </FormGroup>
          <FormGroup>
            {showLoader ? (
              <BarLoader width={100} widthUnit="%" color="#2745fb" />
            ) : null}
            <Button className="neutrinoButton my-4" onClick={this.login}>
              Login
            </Button>
          </FormGroup>
        </div>
      );
    }

    if (['gloryNotify', 'soleNotify', 'globalHeat'].includes(authServer)) {
      return (
        <div>
          <FormGroup>
            {showLoader ? (
              <BarLoader width={100} widthUnit="%" color="#2745fb" />
            ) : null}
            <Button className="neutrinoButton my-4" onClick={this.login}>
              <div className="m-2">Login With Discord</div>
              <div>
                <FontAwesomeIcon size="3x" icon={['fab', 'discord']} />
              </div>
            </Button>
          </FormGroup>
        </div>
      );
    }
  };

  render() {
    const { authorised, message } = this.props;
    return (
      <Container fluid className="d-flex flex-column h-100">
        <Header showPageTitle={false} />
        <Row className="flex-fill justify-content-center align-items-center">
          <Col xs="6">
            <div id="loginWindow">
              <Form>
                <FormGroup className="text-center">
                  <img
                    alt="Neutrino Text Logo"
                    id="loginLogo"
                    draggable="false"
                    className="my-3"
                    src={neutrinoTextLogo}
                  />
                </FormGroup>
                {this.returnAuthServerImage()}
                {!authorised && message !== '' ? (
                  <Row id="loginErrorCard" className="text-center">
                    <Col>{message}</Col>
                  </Row>
                ) : null}
                {this.returnAuthServerForm()}
              </Form>
            </div>
          </Col>
        </Row>
        <Row>
          <Col id="serverSelection" xs={{ size: 2, offset: 10 }}>
            <Form>
              <FormGroup>
                <Label>Server</Label>
                <Input
                  onChange={this.handleChange}
                  name="authServer"
                  type="select"
                >
                  <option value="neutrino">Neutrino</option>
                  <option value="blazeUnlimited">BlazeUnlimited</option>
                  <option value="gloryNotify">GloryNotify</option>
                  <option value="soleNotify">SoleNotify</option>
                  <option value="globalHeat">GlobalHeat</option>
                </Input>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

Login.propTypes = {
  authorised: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  setAuthAndMessage: PropTypes.func.isRequired
};
