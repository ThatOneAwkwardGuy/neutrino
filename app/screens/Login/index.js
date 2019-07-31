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
import Header from '../../components/Header';
import neutrinoTextLogo from '../../images/textLogo.svg';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      pass: '',
      showLoader: false
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  login = async () => {
    const { email, pass } = this.state;
    const { setAuthAndMessage } = this.props;
    this.setState({ showLoader: true });
    setAuthAndMessage(false, '');
    try {
      const auth = getAuth();
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (error) {
      console.log(error);
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

  render() {
    const { authorised, message } = this.props;
    const { showLoader } = this.state;
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
                {!authorised && message !== '' ? (
                  <Row id="loginErrorCard" className="text-center">
                    <Col>{message}</Col>
                  </Row>
                ) : null}
                <FormGroup className="my-4">
                  <Label className="boldLabel">Email</Label>
                  <Input
                    name="email"
                    type="text"
                    onChange={this.handleChange}
                  />
                </FormGroup>
                <FormGroup className="my-4">
                  <Label className="boldLabel">Password</Label>
                  <Input
                    name="pass"
                    type="password"
                    onChange={this.handleChange}
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
              </Form>
            </div>
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
