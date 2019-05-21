import React, { Component } from 'react';
import { Alert, Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth } from '../api/firebase/';
import Particles from 'react-particles-js';
import { setUserToCurrentlyInactive, setUserMachineIDOnFirstLoad, checkIfUserMachineIDMatches } from '../api/firebase/firestore';
import { BounceLoader } from 'react-spinners';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginEmail: '',
      loginPassword: '',
      formError: false,
      loginError: false,
      currentlyLoggingIn: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    // window.onbeforeunload = e => {
    //   auth.authorise.onAuthStateChanged(user => {
    //     if (user) {
    //       setUserToCurrentlyInactive(user.uid);
    //     }
    //   });
    // };
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onDismiss() {
    this.setState({
      formError: false
    });
  }

  componentDidMount() {
    if (location.hash === '#waiting') {
      this.props.history.push('/waiting');
    } else if (location.hash === '#captcha') {
      this.props.history.push('/captcha');
    } else if (location.hash === '#activity') {
      this.props.history.push('/activity');
    } else {
      try {
        this.checkLoggedIn();
      } catch (error) {
        console.log(error);
        this.setState({
          loginError: true,
          currentlyLoggingIn: false
        });
      }
    }
  }

  checkLoggedIn = async () => {
    if (process.env.NODE_ENV !== 'development') {
      try {
        await auth.authorise.onAuthStateChanged(async user => {
          if (user !== null) {
            console.log(user);
            this.setState({
              currentlyLoggingIn: true
            });
            await setUserMachineIDOnFirstLoad(user.uid);
            const machineIDStatus = await checkIfUserMachineIDMatches(user.uid);
            if (machineIDStatus) {
              this.props.history.push('/bot');
            } else {
              this.setState({
                loginError: true,
                currentlyLoggingIn: false
              });
            }
          }
        });
      } catch (error) {
        console.log(error);
        this.setState({
          loginError: true,
          currentlyLoggingIn: false
        });
      }
    } else {
      this.props.history.push('/bot');
    }
  };

  handleLogin = async () => {
    try {
      this.setState({
        currentlyLoggingIn: true
      });
      await auth.doSignInWithEmailAndPassword(this.state.loginEmail, this.state.loginPassword);
      await this.checkLoggedIn();
    } catch (e) {
      console.log(e);
      this.setState({
        formError: true,
        currentlyLoggingIn: false
      });
    }
  };

  render() {
    return (
      <div>
        <Container fluid>
          <div className="loginTopBar">
            <Header headerType="Login" />
          </div>
          <Row className="loginContainer">
            <Container>
              <Row>
                <Col xs="4">
                  <Alert color="danger" isOpen={this.state.formError} toggle={this.onDismiss}>
                    you may have entered the wrong details, please try again or contact us via the discord.
                  </Alert>
                  <Alert color="danger" isOpen={this.state.loginError}>
                    it appears there was a problem logging you in, this maybe be due to incorrect account info or your account may be bound to another machine,
                    if this is the case, you can login and unbind your account.
                  </Alert>
                  <Form>
                    <FormGroup row>
                      <Col xs="12">
                        <Label>email</Label>
                        <Input
                          type="text"
                          name="loginEmail"
                          id="loginEmail"
                          onChange={e => {
                            this.handleChange(e);
                          }}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col xs="12">
                        <Label>password</Label>
                        <Input
                          type="password"
                          name="loginPassword"
                          id="loginPassword"
                          onChange={e => {
                            this.handleChange(e);
                          }}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col xs="4">
                        <Button
                          onClick={() => {
                            this.handleLogin();
                          }}
                          className="primaryButton"
                        >
                          login
                        </Button>
                      </Col>
                    </FormGroup>
                  </Form>
                </Col>
                <Col xm="8">
                  <BounceLoader color={'#03a9f4'} loading={this.state.currentlyLoggingIn} />
                </Col>
              </Row>
            </Container>
          </Row>
          <div className="loginFooter">
            <Footer type="login" />
          </div>
        </Container>
      </div>
    );
  }
}

export default Login;
