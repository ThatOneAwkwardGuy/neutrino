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
import { getAuth } from '../../utils/firebase';
import Header from '../../components/Header';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      pass: ''
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  login = async () => {
    const { email, pass } = this.state;
    const auth = getAuth();
    await auth.signInWithEmailAndPassword(email, pass);
  };

  render() {
    return (
      <Container fluid className="d-flex flex-column h-100">
        <Header />
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
                    src="./images/textLogo.svg"
                  />
                </FormGroup>
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
