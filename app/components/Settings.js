import React, { Component } from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, Button, Form, FormGroup, Input, Container } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const { dialog } = require('electron').remote;

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        googleCredentialsPath: '',
        googleCredentialsPojectID: '',
        awsAccessKey: '',
        awsSecretKey: '',
        vultrAPIKey: '',
        digitalOceanAPIKey: ''
      }
    };
  }
  componentDidMount() {
    this.initialize();
  }

  initialize() {
    this.setState({
      settings: this.props.settings
    });
  }

  handleChange = e => {
    this.setState({
      settings: {
        ...this.state.settings,
        [e.target.name]: e.target.value
      }
    });
  };

  importFile = (name, settingsName) => {
    dialog.showOpenDialog(
      {
        filters: [{ name: name, extensions: ['json', 'txt'] }]
      },
      fileNames => {
        if (fileNames === undefined) {
          return;
        } else {
          this.handleChange({
            target: {
              name: settingsName,
              value: fileNames[0]
            }
          });
        }
      }
    );
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow">
          <Form>
            <FormGroup row>
              <Col xs="4">
                <label>Google Cloud Credentials</label>
                <Button
                  style={{ display: 'block' }}
                  className="nButton"
                  onClick={() => {
                    this.importFile('Google Cloud Credentials', 'googleCredentialsPath');
                  }}
                >
                  browse
                </Button>
              </Col>
              <Col xs="6">
                <label>Google Cloud Project ID</label>
                <Input
                  type="text"
                  name="googleCredentialsPojectID"
                  value={this.state.settings.googleCredentialsPojectID}
                  onChange={e => {
                    this.handleChange(e);
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="6">
                <label>Amazon AWS Access Key</label>
                <Input
                  type="text"
                  name="awsAccessKey"
                  value={this.state.settings.awsAccessKey}
                  onChange={e => {
                    this.handleChange(e);
                  }}
                />
              </Col>
              <Col xs="6">
                <label>Amazon AWS Secret Key</label>
                <Input
                  type="text"
                  name="awsSecretKey"
                  value={this.state.settings.awsSecretKey}
                  onChange={e => {
                    this.handleChange(e);
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="6">
                <label>Vultr API Key</label>
                <Input
                  type="text"
                  name="vultrAPIKey"
                  value={this.state.settings.vultrAPIKey}
                  onChange={e => {
                    this.handleChange(e);
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="6">
                <label>DigitalOcean API Key</label>
                <Input
                  type="text"
                  name="digitalOceanAPIKey"
                  value={this.state.settings.digitalOceanAPIKey}
                  onChange={e => {
                    this.handleChange(e);
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="2" className="ml-auto">
                <Button
                  onClick={() => {
                    this.props.onUpdateSettings(this.state.settings);
                  }}
                >
                  save
                </Button>
              </Col>
            </FormGroup>
          </Form>
        </Container>
      </CSSTransition>
    );
  }
}
