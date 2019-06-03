import React, { Component } from 'react';
import { Row, Col, Button, Form, FormGroup, Input, Container, Label } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import Toggle from 'react-toggle';
const { dialog } = require('electron').remote;
import FontAwesome from 'react-fontawesome';
var shell = require('electron').shell;
import { auth } from '../api/firebase';
import { ipcRenderer } from 'electron';
import { CHECK_FOR_UPDATES } from '../utils/constants';
export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        activityDelayMin: 60000,
        activityDelayMax: 120000,
        googleCredentialsPath: '',
        googleCredentialsPojectID: '',
        awsAccessKey: '',
        awsSecretKey: '',
        vultrAPIKey: '',
        digitalOceanAPIKey: '',
        showAcitivtyWindows: false
      }
    };
  }
  componentDidMount() {
    this.initialize();
  }

  save = () => {
    this.props.onUpdateSettings(this.state.settings);

    // if (this.state.settings.activityDelayMin > this.state.settings.activityDelayMax) {
    //   this.setState({ settings: { ...this.state.settings, activityDelayMax: this.state.settings.activityDelayMin + 1 } }, () => {
    //     this.props.onUpdateSettings(this.state.settings);
    //   });
    // } else {
    //   this.props.onUpdateSettings(this.state.settings);
    // }
  };

  signOut = () => {
    auth.signOut();
    this.props.history.push('/');
  };

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

  toggleButton = e => {
    this.setState({
      settings: {
        ...this.state.settings,
        [e.target.name]: !this.state.settings[e.target.name]
      }
    });
  };

  checkForUpdate = () => {
    this.props.setLoading('Checking For Updates', true, true);
    ipcRenderer.send(CHECK_FOR_UPDATES);
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Form style={{ marginTop: '20px' }} className="flex-grow-1">
            <h6>
              <strong>Proxy Creator</strong>
            </h6>
            <FormGroup row>
              <Col xs="4">
                <label>
                  Google Cloud Credentials File (json){' '}
                  <a
                    onClick={() => {
                      shell.openExternal('https://cloud.google.com/video-intelligence/docs/common/auth');
                    }}
                  >
                    <FontAwesome name="question" className="twitterLogoFooter logoFooter" />
                  </a>
                </label>
                <Button
                  style={{ display: 'block' }}
                  className="nButton"
                  onClick={() => {
                    this.importFile('Google Cloud Credentials', 'googleCredentialsPath');
                  }}
                >
                  Browse
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
            {/* <FormGroup row>
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
            </FormGroup> */}
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
            <h6>
              <strong>Activity Generator</strong>
            </h6>
            <FormGroup row>
              <Col xs="2">
                <Label>
                  <span>Show Activity Windows</span>
                  <div style={{ marginTop: '15px' }}>
                    <Toggle name="showAcitivtyWindows" checked={this.state.settings.showAcitivtyWindows} onChange={this.toggleButton} />
                  </div>
                </Label>
              </Col>
              <Col xs="2">
                <Label>
                  <span>Activity Delay Min (ms)</span>
                  <div style={{ marginTop: '15px' }}>
                    <Input
                      type="number"
                      name="activityDelayMin"
                      min={0}
                      max={parseInt(this.state.settings.activityDelayMax) - 1}
                      value={this.state.settings.activityDelayMin}
                      onChange={e => {
                        this.handleChange(e);
                      }}
                    />
                  </div>
                </Label>
              </Col>
              <Col xs="2">
                <Label>
                  <span>Activity Delay Max (ms)</span>
                  <div style={{ marginTop: '15px' }}>
                    <Input
                      type="number"
                      name="activityDelayMax"
                      min={parseInt(this.state.settings.activityDelayMin) + 1}
                      value={this.state.settings.activityDelayMax}
                      onChange={e => {
                        this.handleChange(e);
                      }}
                    />
                  </div>
                </Label>
              </Col>
            </FormGroup>
            {/* <h6>
              <strong>Updates</strong>
            </h6>
            <FormGroup row>
              <Col>
                {this.props.settings.update.status === 'N' ? `No updates as of ${new Date(this.props.settings.update.lastChecked).toUTCString()}` : null}
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col>
                <Button onClick={this.checkForUpdate}>Check For Updates</Button>
              </Col>
            </FormGroup> */}
          </Form>
          <Row>
            <Col xs="2">
              <Button color="danger" onClick={this.signOut}>
                Sign Out
              </Button>
            </Col>
            <Col xs="2" className="ml-auto text-right">
              <Button onClick={this.save}>Save</Button>
            </Col>
          </Row>
        </Container>
      </CSSTransition>
    );
  }
}
