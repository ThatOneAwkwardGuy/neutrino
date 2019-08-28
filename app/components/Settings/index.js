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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { remote } from 'electron';

import PropTypes from 'prop-types';

import { upperCaseFirst, generateUEID } from '../../utils/utils';
import { signOut } from '../../utils/firebase';

const fs = require('fs');
const { dialog } = require('electron').remote;

const appPath = remote.app.getAppPath();

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
      digitalOceanAPIKey: '',
      linodeAPIKey: '',
      awsAccessKey: '',
      awsSecretKey: ''
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
      vultrAPIKey,
      linodeAPIKey,
      awsAccessKey,
      awsSecretKey
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
      case 'linode':
        account.apiKey = linodeAPIKey;
        break;
      case 'aws':
        account.awsAccessKey = awsAccessKey;
        account.awsSecretKey = awsSecretKey;
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
      digitalOceanAPIKey: '',
      linodeAPIKey: ''
    });
  };

  handleSettingsChange = e => {
    const { setKeyInSetting } = this.props;
    const { name, value } = e.target;
    setKeyInSetting(name, value);
  };

  handleSettingsToggleChange = e => {
    const { name } = e.target;
    const { settings, setKeyInSetting } = this.props;
    setKeyInSetting(name, !settings[name]);
  };

  returnAwsProviderFeilds = () => {
    const { accountName, awsAccessKey, awsSecretKey } = this.state;
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
          <Label>Access Key*</Label>
          <Input
            type="text"
            name="awsAccessKey"
            value={awsAccessKey}
            onChange={this.handleChange}
          />
        </Col>
        <Col>
          <Label>Secret Key*</Label>
          <Input
            type="text"
            name="awsSecretKey"
            value={awsSecretKey}
            onChange={this.handleChange}
          />
        </Col>
        <Col xs="2">
          <Button onClick={this.addAccount}>Add</Button>
        </Col>
      </Row>
    );
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

  returnLinodeProviderFields = () => {
    const { accountName, linodeAPIKey } = this.state;
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
            name="linodeAPIKey"
            value={linodeAPIKey}
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
      case 'linode':
        return this.returnLinodeProviderFields();
      case 'aws':
        return this.returnAwsProviderFeilds();
      default:
        return [];
    }
  };

  returnProviderAccountIdentifier = account => {
    if (account.apiKey) {
      return account.apiKey;
    }
    if (account.awsAccessKey) {
      return account.awsAccessKey;
    }
    if (account.googleCredentialsProjectID) {
      return account.googleCredentialsProjectID;
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
          {this.returnProviderAccountIdentifier(account)}
        </Col>
        {provider === 'aws' ? (
          <Col className="text-center">{account.awsSecretKey}</Col>
        ) : null}
        <Col className="text-center">
          <FontAwesomeIcon
            icon="trash"
            onClick={() => {
              removeProxyProviderAccount(selectedProxyProvider, index);
            }}
          />
        </Col>
      </Row>
    ));
  };

  saveCSVTemplate = () => {
    console.log(appPath);
    fs.readFile(
      process.env.NODE_ENV === 'development'
        ? `${appPath}/constants/Neutrino_CSV_Template.csv`
        : `${appPath}/app/constants/Neutrino_CSV_Template.csv`,
      'UTF-8',
      (err, data) => {
        console.log(err);
        if (!err) {
          dialog.showSaveDialog(
            {
              title: 'name',
              defaultPath: `~/Neutrino CSV Template.csv`
            },
            fileName => {
              if (fileName === undefined) {
                return;
              }
              fs.writeFile(fileName, data, () => {});
            }
          );
        }
      }
    );
  };

  render() {
    const { selectedProxyProvider } = this.state;
    const { settings } = this.props;
    return (
      <Row className="h-100">
        <Col className="overflow-y-scroll h-100">
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
              <Col xs="10">
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
                      {selectedProxyProvider === 'aws' ? (
                        <Col className="text-center font-weight-bold">
                          Secret API Key
                        </Col>
                      ) : null}
                      <Col className="text-center font-weight-bold">
                        Actions
                      </Col>
                    </Row>
                  ) : null}
                  {this.returnProviderAccounts(selectedProxyProvider)}
                </Container>
              </Col>
            </Row>
            <h6 className="font-weight-bold py-3">One Click Generator</h6>
            <Row className="p-3 align-items-end">
              <Col xs="3">
                <Label>Min Delay</Label>
                <Input
                  type="number"
                  name="activityDelayMin"
                  onChange={this.handleSettingsChange}
                  value={settings.activityDelayMin}
                />
              </Col>
              <Col xs="3">
                <Label>Max Delay</Label>
                <Input
                  type="number"
                  name="activityDelayMax"
                  onChange={this.handleSettingsChange}
                  value={settings.activityDelayMax}
                />
              </Col>
            </Row>
            <Row className="panel-middle p-3 align-items-end">
              <Col>
                <Label>Show Activity Windows</Label>
                <CustomInput
                  type="switch"
                  id="showAcitivtyWindows"
                  name="showAcitivtyWindows"
                  checked={settings.showAcitivtyWindows}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>Google Search</Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleSearch"
                  name="activityGoogleSearch"
                  checked={settings.activityGoogleSearch}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>Google News</Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleNews"
                  name="activityGoogleNews"
                  checked={settings.activityGoogleNews}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>Google Shopping</Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleShopping"
                  name="activityGoogleShopping"
                  checked={settings.activityGoogleShopping}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>Youtube</Label>
                <CustomInput
                  type="switch"
                  id="activityYoutube"
                  name="activityYoutube"
                  checked={settings.activityYoutube}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
            </Row>
            <h6 className="font-weight-bold py-3">Neutrino CSV Template</h6>
            <Row className="panel-middle p-3 align-items-end">
              <Col xs="3">
                <Button onClick={this.saveCSVTemplate}>Save</Button>
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
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  removeProxyProviderAccount: PropTypes.func.isRequired,
  setKeyInSetting: PropTypes.func.isRequired
};
