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
import BarLoader from 'react-spinners/BarLoader';
import PropTypes from 'prop-types';
import { getAuth } from '../../utils/firebase';
import { getExternalAuth } from '../../utils/services';
import Header from '../../components/Header';
import neutrinoTextLogo from '../../images/textLogo.svg';
import blazeUnlimitedLogo from '../../images/blazeUnlimited.png';

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
  };

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      this.login();
    }
  };

  returnAuthServerImage = () => {
    const { authServer } = this.state;
    let authServerImage = null;
    console.log(authServer);
    switch (authServer) {
      case 'blazeUnlimited':
        authServerImage = blazeUnlimitedLogo;
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
            className="my-3 w-100"
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
      default:
        this.loginWithExternalAuth();
        break;
    }
  };

  render() {
    const { authorised, message } = this.props;
    const { showLoader, authServer } = this.state;
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
                {authServer === 'neutrino' ? (
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
                  </div>
                ) : (
                  <FormGroup className="my-4">
                    <Label className="boldLabel">Key</Label>
                    <Input
                      name="key"
                      type="text"
                      onChange={this.handleChange}
                      onKeyPress={this.handleKeyPress}
                    />
                  </FormGroup>
                )}
                <FormGroup>
                  {showLoader ? (
                    <BarLoader width={100} widthUnit="%" color="#2745fb" />
                  ) : null}
                  <Button className="neutrinoButton my-4" onClick={this.login}>
                    Login
                  </Button>
                </FormGroup>
              </Form>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 2, offset: 10 }}>
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
