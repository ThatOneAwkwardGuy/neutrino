import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  CustomInput,
  Button
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import { upperCaseFirst, generateUEID } from '../../utils/utils';
import { signOut } from '../../utils/firebase';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountName: '',
      selectedProxyProvider: '',
      googleCredentialsPath: '',
      googleCredentialsFileName: '',
      googleCredentialsProjectID: '',
      vultrAPIKey: '',
      digitalOceanAPIKey: ''
    };
  }

  handleChange = e => {
    if (e.target.name === 'googleCredentialsPath') {
      this.setState({
        [e.target.name]: e.target.files[0].path,
        googleCredentialsFileName: e.target.files[0].name
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value
      });
    }
  };

  addAccount = () => {
    const {
      selectedProxyProvider,
      accountName,
      googleCredentialsPath,
      googleCredentialsProjectID,
      digitalOceanAPIKey,
      vultrAPIKey
    } = this.state;
    const { addProxyProviderAccount } = this.props;
    const account = {
      provider: selectedProxyProvider,
      name: accountName
    };
    switch (selectedProxyProvider) {
      case 'google':
        account.googleCredentialsPath = googleCredentialsPath;
        account.googleCredentialsProjectID = googleCredentialsProjectID;
        break;
      case 'digitalocean':
        account.apiKey = digitalOceanAPIKey;
        break;
      case 'vultr':
        account.apiKey = vultrAPIKey;
        break;
      default:
        break;
    }
    addProxyProviderAccount(account);
    this.setState({
      accountName: '',
      googleCredentialsPath: '',
      googleCredentialsFileName: '',
      googleCredentialsProjectID: '',
      vultrAPIKey: '',
      digitalOceanAPIKey: ''
    });
  };

  returnDigitalOceanProviderFields = () => {
    const { accountName, digitalOceanAPIKey } = this.state;
    return (
      <Row className="p-3 align-items-end">
        <Col>
          <Label>Account Name*</Label>
          <Input
            type="text"
            name="accountName"
            value={accountName}
            onChange={this.handleChange}
          />
        </Col>
        <Col>
          <Label>API Key*</Label>
          <Input
            type="text"
            name="digitalOceanAPIKey"
            value={digitalOceanAPIKey}
            onChange={this.handleChange}
          />
        </Col>
        <Col xs="2">
          <Button onClick={this.addAccount}>Add</Button>
        </Col>
      </Row>
    );
  };

  returnGoogleCloudProviderFields = () => {
    const {
      accountName,
      googleCredentialsProjectID,
      googleCredentialsFileName
    } = this.state;
    return (
      <Row className="p-3 align-items-end">
        <Col>
          <Label>Account Name*</Label>
          <Input
            type="text"
            name="accountName"
            value={accountName}
            onChange={this.handleChange}
          />
        </Col>
        <Col>
          <Label>Project ID*</Label>
          <Input
            type="text"
            name="googleCredentialsProjectID"
            value={googleCredentialsProjectID}
            onChange={this.handleChange}
          />
        </Col>
        <Col>
          <Label>Credentials Path (.json)*</Label>
          <CustomInput
            type="file"
            id="googleCredentialsPath"
            name="googleCredentialsPath"
            onChange={this.handleChange}
            label={
              this.googleCredentialsFileName !== ''
                ? googleCredentialsFileName
                : 'Choose file'
            }
          >
            {googleCredentialsFileName}
          </CustomInput>
        </Col>
        <Col xs="2">
          <Button onClick={this.addAccount}>Add</Button>
        </Col>
      </Row>
    );
  };

  returnVultrProviderFields = () => {
    const { accountName, vultrAPIKey } = this.state;
    return (
      <Row className="p-3 align-items-end">
        <Col>
          <Label>Account Name*</Label>
          <Input
            type="text"
            name="accountName"
            value={accountName}
            onChange={this.handleChange}
          />
        </Col>
        <Col>
          <Label>API Key*</Label>
          <Input
            type="text"
            name="vultrAPIKey"
            value={vultrAPIKey}
            onChange={this.handleChange}
          />
        </Col>
        <Col xs="2">
          <Button onClick={this.addAccount}>Add</Button>
        </Col>
      </Row>
    );
  };

  returnProviderFields = provider => {
    switch (provider) {
      case 'google':
        return this.returnGoogleCloudProviderFields();
      case 'digitalocean':
        return this.returnDigitalOceanProviderFields();
      case 'vultr':
        return this.returnVultrProviderFields();
      default:
        return [];
    }
  };

  returnProviderAccounts = provider => {
    const { settings, removeProxyProviderAccount } = this.props;
    const { selectedProxyProvider } = this.state;
    if (provider === '') return;
    if (!settings.proxyAccounts[provider]) return;
    return settings.proxyAccounts[provider].map((account, index) => (
      <Row
        key={`${provider}-account-${generateUEID()}`}
        className="p-2 manualTableRow"
      >
        <Col className="text-center">{account.name}</Col>
        <Col className="text-center">
          {account.apiKey ? account.apiKey : account.googleCredentialsProjectID}
        </Col>
        <Col className="text-center">
          <FontAwesome
            name="trash"
            onClick={() => {
              removeProxyProviderAccount(selectedProxyProvider, index);
            }}
          />
        </Col>
      </Row>
    ));
  };

  render() {
    const { selectedProxyProvider } = this.state;
    const { settings } = this.props;
    return (
      <Row>
        <Col>
          <Container fluid className="px-0 py-3 d-flex flex-column">
            <h6 className="font-weight-bold">Proxy Provider Accounts</h6>
            <Row className="p-3 align-items-end">
              <Col xs="3">
                <Label>Provider</Label>
                <Input
                  type="select"
                  name="selectedProxyProvider"
                  onChange={this.handleChange}
                  value={selectedProxyProvider}
                >
                  <option key="proxyProvider-disabled" disabled value="">
                    Select a provider
                  </option>
                  {Object.keys(settings.proxyAccounts).map(provider => (
                    <option
                      key={`proxyProvider-${generateUEID()}`}
                      value={provider}
                    >
                      {upperCaseFirst(provider)}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col>
                {selectedProxyProvider !== '' ? (
                  <h6>
                    Number of accounts :{' '}
                    {selectedProxyProvider !== '' &&
                    settings.proxyAccounts[selectedProxyProvider] !== undefined
                      ? settings.proxyAccounts[selectedProxyProvider].length
                      : 0}
                  </h6>
                ) : null}
              </Col>
            </Row>
            {this.returnProviderFields(selectedProxyProvider)}
            <Row className="panel-middle p-3 align-items-end">
              <Col xs="6">
                <Container>
                  {selectedProxyProvider !== '' &&
                  settings.proxyAccounts[selectedProxyProvider] !== undefined &&
                  settings.proxyAccounts[selectedProxyProvider].length > 0 ? (
                    <Row className="p-2 manualTableRow">
                      <Col className="text-center font-weight-bold">
                        Account Name
                      </Col>
                      <Col className="text-center font-weight-bold">
                        {selectedProxyProvider === 'google'
                          ? 'Project ID'
                          : 'API Key'}
                      </Col>
                      <Col className="text-center font-weight-bold">
                        Actions
                      </Col>
                    </Row>
                  ) : null}
                  {this.returnProviderAccounts(selectedProxyProvider)}
                </Container>
              </Col>
            </Row>
            <h6 className="font-weight-bold py-3">Account</h6>
            <Row className="panel-middle py-3">
              <Col xs="3">
                <Button color="danger" onClick={signOut}>
                  Sign Out
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

Settings.propTypes = {
  addProxyProviderAccount: PropTypes.func.isRequired,
  settings: PropTypes.objectOf(PropTypes.object).isRequired,
  removeProxyProviderAccount: PropTypes.func.isRequired
};
