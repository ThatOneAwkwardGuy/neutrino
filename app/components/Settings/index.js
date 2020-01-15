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
import { Tooltip } from 'react-tippy';
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
      // smsApiKey: '',
      // selectedSmsProvider: ''
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
    fs.readFile(
      process.env.NODE_ENV === 'development'
        ? `${appPath}/constants/Neutrino_CSV_Template.csv`
        : `${appPath}/app/constants/Neutrino_CSV_Template.csv`,
      'UTF-8',
      (err, data) => {
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
                <Label>
                  Provider{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Which Proxy provider would you like to enter the details for?"
                    target="parallelRaffleEntriesLabel"
                  >
                    <FontAwesomeIcon
                      id="parallelRaffleEntriesLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
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
                <Label>
                  One Click Check{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the one click generator should check if your Gmail account passes
                  one-click tests."
                    target="oneClickCheckTimingBoolLabel"
                  >
                    <FontAwesomeIcon
                      id="oneClickCheckTimingBoolLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="oneClickCheckTimingBool"
                  name="oneClickCheckTimingBool"
                  checked={settings.oneClickCheckTimingBool}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col xs="3">
                <Label>
                  One Click Check Timing (m){' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="How often, in minutes, to check if your Gmail account passes
                  one-click tests."
                    target="oneClickCheckTimingLabel"
                  >
                    <FontAwesomeIcon
                      id="oneClickCheckTimingLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  name="oneClickCheckTiming"
                  onChange={this.handleSettingsChange}
                  value={settings.oneClickCheckTiming}
                />
              </Col>
            </Row>
            <Row className="p-3 align-items-end">
              <Col xs="3">
                <Label>
                  Min Delay (ms){' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The minimum time, in miliseconds, the one click generator
                  should wait before performing an activity."
                    target="activityDelayMinLabel"
                  >
                    <FontAwesomeIcon
                      id="activityDelayMinLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  name="activityDelayMin"
                  onChange={this.handleSettingsChange}
                  value={settings.activityDelayMin}
                />
              </Col>
              <Col xs="3">
                <Label>
                  Max Delay (ms){' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The maxiumum time, in miliseconds, the one click generator
                  should wait before performing an activity."
                    target="activityDelayMaxLabel"
                  >
                    <FontAwesomeIcon
                      id="activityDelayMaxLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
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
                <Label>
                  Show Activity Windows{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the windows of the one click generator should be
                    shown."
                    target="showAcitivtyWindowsLabel"
                  >
                    <FontAwesomeIcon
                      id="showAcitivtyWindowsLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="showAcitivtyWindows"
                  name="showAcitivtyWindows"
                  checked={settings.showAcitivtyWindows}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>
                  Google Search{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the one click generator windows should perform Google
                  searches."
                    target="activityGoogleSearchLabel"
                  >
                    <FontAwesomeIcon
                      id="activityGoogleSearchLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleSearch"
                  name="activityGoogleSearch"
                  checked={settings.activityGoogleSearch}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>
                  Google News{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the one click generator windows should perform Google
                  News searches."
                    target="activityGoogleNewsLabel"
                  >
                    <FontAwesomeIcon
                      id="activityGoogleSearchLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleNews"
                  name="activityGoogleNews"
                  checked={settings.activityGoogleNews}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>
                  Google Shopping{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the one click generator windows should perform Google
                  Shopping searches."
                    target="activityGoogleShoppingLabel"
                  >
                    <FontAwesomeIcon
                      id="activityGoogleShoppingLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="activityGoogleShopping"
                  name="activityGoogleShopping"
                  checked={settings.activityGoogleShopping}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
              <Col>
                <Label>
                  Youtube{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Whether the one click generator windows should watch Youtube
                  videos."
                    target="activityYoutubeLabel"
                  >
                    <FontAwesomeIcon
                      id="activityYoutubeLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <CustomInput
                  type="switch"
                  id="activityYoutube"
                  name="activityYoutube"
                  checked={settings.activityYoutube}
                  onChange={this.handleSettingsToggleChange}
                />
              </Col>
            </Row>
            <h6 className="font-weight-bold py-3">Raffle Bot</h6>
            <Row className="p-3 panel-middle align-items-end">
              <Col xs="3">
                <Label>
                  Parallel Entries{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="How many raffle entries should be started at the same time."
                    target="parallelRaffleEntriesLabel"
                  >
                    <FontAwesomeIcon
                      id="parallelRaffleEntriesLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  name="parallelRaffleEntries"
                  onChange={this.handleSettingsChange}
                  value={settings.parallelRaffleEntries}
                />
              </Col>
              <Col xs="3">
                <Label>
                  Raffle Entry Delay (ms){' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Delay between each number of parallel raffle entries."
                    target="raffleEntryDelayLabel"
                  >
                    <FontAwesomeIcon
                      id="raffleEntryDelayLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  name="raffleEntryDelay"
                  onChange={this.handleSettingsChange}
                  value={settings.raffleEntryDelay}
                />
              </Col>
            </Row>
            <Row className="p-3 align-items-end">
              <Col xs="3">
                <Label>
                  2Captcha API Key{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Your 2Capthca API Key"
                    target="TwoCaptchaAPIKeyLabel"
                  >
                    <FontAwesomeIcon
                      id="TwoCaptchaAPIKeyLabel"
                      icon="question-circle"
                    />{' '}
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  name="2CaptchaAPIKey"
                  onChange={this.handleSettingsChange}
                  value={settings['2CaptchaAPIKey']}
                />
              </Col>
              <Col xs="3">
                <Label>
                  AntiCaptcha API Key{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Your AntiCaptcha API Key"
                    target="AntiCaptchaAPIKeyLabel"
                  >
                    <FontAwesomeIcon
                      id="AntiCaptchaAPIKeyLabel"
                      icon="question-circle"
                    />
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  name="AntiCaptchaAPIKey"
                  onChange={this.handleSettingsChange}
                  value={settings.AntiCaptchaAPIKey}
                />
              </Col>
              {/* <Col xs="3">
                <Label>ImageTypers API Key</Label>
                <Input
                  type="text"
                  name="ImageTypersAPIKey"
                  onChange={this.handleSettingsChange}
                  value={settings.ImageTypersAPIKey}
                />
              </Col> */}
            </Row>
            <Row className="p-3 panel-middle align-items-end">
              <Col xs="3">
                <Label>Captcha API</Label>{' '}
                <Tooltip
                  arrow
                  distance={20}
                  title="Which Captcha API should be used when a Google CAPTCHA is needed"
                  target="parallelRaffleEntriesLabel"
                >
                  <FontAwesomeIcon
                    id="parallelRaffleEntriesLabel"
                    icon="question-circle"
                  />
                </Tooltip>
                <Input
                  type="select"
                  name="CaptchaAPI"
                  onChange={this.handleSettingsChange}
                  value={settings.CaptchaAPI}
                >
                  <option key={generateUEID()} value="">
                    Manual
                  </option>
                  <option key={generateUEID()} value="2Captcha">
                    2Captcha
                  </option>
                  <option key={generateUEID()} value="AntiCaptcha">
                    AntiCaptcha
                  </option>
                  {/* <option value="ImageTypers">ImageTypers</option> */}
                </Input>
              </Col>
            </Row>
            {/* <Row className="p-3 align-items-end">
              <Col xs="3">
                <Label>
                  GetSMSCode API Key{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="Your GetSMSCode API Key"
                    target="GetSMSCodeAPIKeyLabel"
                  >
                    <FontAwesomeIcon
                      id="GetSMSCodeAPIKeyLabel"
                      icon="question-circle"
                    />{' '}
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  name="GetSMSCodeAPIKey"
                  onChange={this.handleSettingsChange}
                  value={settings.GetSMSCodeAPIKey}
                />
              </Col>
            </Row>
            <Row className="p-3 panel-middle align-items-end">
              <Col xs="3">
                <Label>SMS API</Label>{' '}
                <Tooltip
                  arrow
                  distance={20}
                  title="Which SMS API should be used when a Google CAPTCHA is needed"
                  target="SMSAPILabel"
                >
                  <FontAwesomeIcon id="SMSAPILabel" icon="question-circle" />
                </Tooltip>
                <Input
                  type="select"
                  name="SMSAPI"
                  onChange={this.handleSettingsChange}
                  value={settings.SMSAPI}
                >
                  <option key={generateUEID()} value="">
                    Select an SMS API Provider
                  </option>
                  <option key={generateUEID()} value="getSMSCode">
                    GetSMSCode
                  </option>
                </Input>
              </Col>
              <Col xs="3">
                <Label>SMS API Username</Label>{' '}
                <Tooltip
                  arrow
                  distance={20}
                  title="The SMS API Username, if its not required then leave empty. Required for GetSMSCode"
                  target="SMSAPIUsernameLabel"
                >
                  <FontAwesomeIcon
                    id="SMSAPIUsernameLabel"
                    icon="question-circle"
                  />
                </Tooltip>
                <Input
                  type="text"
                  name="SMSAPIUsername"
                  onChange={this.handleSettingsChange}
                  value={settings.SMSAPIUsername}
                />
              </Col>
            </Row> */}

            <h6 className="font-weight-bold py-3">
              Neutrino CSV Template{' '}
              <Tooltip
                arrow
                distance={20}
                title="The Neutrino CSV template for mass conversion, editing and/or creating of profiles."
                target="parallelRaffleEntriesLabel"
              >
                <FontAwesomeIcon
                  id="parallelRaffleEntriesLabel"
                  icon="question-circle"
                />
              </Tooltip>
            </h6>
            <Row className="panel-middle p-3 align-items-end">
              <Col xs="3">
                <Button onClick={this.saveCSVTemplate}>Download</Button>
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
