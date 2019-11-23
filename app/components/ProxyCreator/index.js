import React, { Component } from 'react';
import { Container, Row, Col, Label, Input, Button } from 'reactstrap';
import { withToastManager } from 'react-toast-notifications';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tippy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  loadGoogleCloudApiRegions,
  loadGoogleCloudApiMachineTypes,
  createGoogleCloudInstance,
  deleteAllGoogleCloudInstances,
  loadDigitalOceanApiRegions,
  loadDigitalOceanApiMachineTypes,
  createDigitalOceanInstance,
  deleteAllDigitalOceanInstances,
  loadVultrApiRegions,
  loadVultrApiMachineTypes,
  createVultrInstance,
  deleteAllVultrInstances,
  loadLinodeApiRegions,
  loadLinodeApiMachineTypes,
  createLinodeInstance,
  deleteAllLinodeInstances,
  loadAWSCloudApiRegions,
  loadAWSMachinesTypes,
  createAWSInstance,
  deleteAllAWSInstances
} from './functions';
import { upperCaseFirst, generateUEID } from '../../utils/utils';
import { copyProxies } from '../ProxyTester/functions';
import Table from '../Table';
import digitaloceanLogo from '../../images/digitalocean.svg';
import vultrLogo from '../../images/vultr.svg';
import googlecloudLogo from '../../images/googlecloud.svg';
import linodeLogo from '../../images/linode.svg';
import awsLogo from '../../images/aws.svg';

const log = require('electron-log');

class ProxyCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: '',
      providerAccount: {},
      providerAccountName: '',
      regions: [],
      machineTypes: [],
      region: '',
      machineType: '',
      proxyGroupName: '',
      proxyUser: '',
      proxyPass: '',
      quantity: '1'
    };
  }

  setProvider = e => {
    this.setState({
      provider: e.target.textContent.toLowerCase(),
      providerAccount: {},
      providerAccountName: '',
      regions: [],
      machineTypes: [],
      region: '',
      machineType: ''
    });
  };

  returnOptions = (option, index) => (
    <option key={generateUEID()} value={index}>
      {option.name}
    </option>
  );

  returnProviderOptions = (name, array) => {
    if (name === 'region') {
      return array.map(elem => (
        <option value={elem.id} key={`region-${generateUEID()}`}>
          {elem.name}
        </option>
      ));
    }
    if (name === 'machine') {
      return array.map(elem => (
        <option value={elem.id} key={`machine-${generateUEID()}`}>
          {elem.name} - {elem.price}
        </option>
      ));
    }
  };

  handleProviderChange = async e => {
    const { settings, setLoading } = this.props;
    const { provider } = this.state;
    const selectedProviderAccount =
      settings.proxyAccounts[provider][e.target.value] || {};
    this.setState(
      {
        providerAccount: selectedProviderAccount,
        providerAccountName: e.target.value
      },
      async () => {
        if (selectedProviderAccount.name !== undefined) {
          try {
            setLoading(true, `Loading ${upperCaseFirst(provider)} API`, false);
            await this.loadProviderApi();
          } catch (error) {
            log.error(error);
          } finally {
            setLoading(false, `Loading ${upperCaseFirst(provider)} API`, false);
          }
        }
      }
    );
  };

  handleChangeTrimmed = e => {
    this.setState({
      [e.target.name]: e.target.value.replace(' ', '-').toLowerCase()
    });
  };

  loadProviderApi = async () => {
    const { provider, providerAccount } = this.state;
    const { setInfoModal } = this.props;
    try {
      switch (provider) {
        case 'google':
          await this.loadGoogleCloudRegions(providerAccount);
          break;
        case 'digitalocean':
          await this.loadDigitalOceanApi(providerAccount);
          break;
        case 'vultr':
          await this.loadVultrRegions();
          break;
        case 'linode':
          await this.loadLinodeRegions(providerAccount);
          break;
        case 'aws':
          await this.loadAWSRegions(providerAccount);
          break;
        default:
          break;
      }
    } catch (error) {
      setInfoModal({
        infoModalShowing: true,
        infoModalHeader: `Errors creating ${provider} proxy`,
        infoModalBody: <div>{JSON.stringify(error.message)}</div>,
        infoModalFunction: '',
        infoModalButtonText: ''
      });
    }
  };

  loadAWSRegions = async providerAccount => {
    const regions = await loadAWSCloudApiRegions(providerAccount);
    this.setState({ regions });
  };

  loadAWSMachines = async () => {
    const machineTypes = loadAWSMachinesTypes();
    this.setState({
      machineTypes
    });
  };

  loadGoogleCloudRegions = async providerAccount => {
    const regions = await loadGoogleCloudApiRegions(providerAccount);
    this.setState({ regions });
  };

  loadGoogleCloudMachines = async (providerAccount, regionID) => {
    const machineTypes = await loadGoogleCloudApiMachineTypes(
      providerAccount,
      regionID
    );
    this.setState({ machineTypes });
  };

  loadDigitalOceanApi = async providerAccount => {
    const [regions, machineTypes] = await Promise.all([
      loadDigitalOceanApiRegions(providerAccount),
      loadDigitalOceanApiMachineTypes(providerAccount)
    ]);
    this.setState({
      regions,
      machineTypes
    });
  };

  loadVultrRegions = async () => {
    const regions = await loadVultrApiRegions();
    this.setState({ regions });
  };

  loadVultrMachines = async (providerAccount, regionID) => {
    const machineTypes = await loadVultrApiMachineTypes(regionID);
    this.setState({ machineTypes });
  };

  loadLinodeRegions = async providerAccount => {
    const regions = await loadLinodeApiRegions(providerAccount);
    this.setState({ regions });
  };

  loadLinodeMachineTypes = async (providerAccount, regionID) => {
    const machineTypes = await loadLinodeApiMachineTypes(
      providerAccount,
      regionID
    );
    this.setState({ machineTypes });
  };

  handleRegionChange = async e => {
    const { provider, providerAccount } = this.state;
    const { setLoading } = this.props;
    const { value } = e.target;
    this.setState({ region: value });
    try {
      setLoading(true, `Loading ${upperCaseFirst(provider)} Machines`, false);
      if (value !== 'disabled') {
        switch (provider) {
          case 'google':
            await this.loadGoogleCloudMachines(providerAccount, e.target.value);
            break;
          case 'vultr':
            await this.loadVultrMachines(providerAccount, e.target.value);
            break;
          case 'linode':
            await this.loadLinodeMachineTypes(providerAccount, e.target.value);
            break;
          case 'aws':
            this.loadAWSMachines();
            break;
          default:
            break;
        }
      }
    } catch (error) {
      log.error(error);
    } finally {
      setLoading(false, `Loading ${upperCaseFirst(provider)} Machines`, false);
    }
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  createProxies = async () => {
    const { quantity, provider, providerAccount } = this.state;
    const { setLoading, incrementProxies, addProxy, setInfoModal } = this.props;
    setLoading(
      true,
      `Creating ${quantity} ${upperCaseFirst(provider)} ${
        quantity === '1' ? 'Proxy' : 'Proxies'
      }`
    );
    const proxyInstances = Array(parseInt(quantity, 10))
      .fill()
      .map((empty, index) => this.returnProxyInstance(index).catch(e => e));
    const resolvedProxyInstances = await Promise.all(proxyInstances);
    const successfulProxies = resolvedProxyInstances
      .filter(proxy => !(proxy instanceof Error))
      .map(proxy => {
        const newProxy = { ...proxy };
        newProxy.providerAccountID = `${provider} - ${providerAccount.name}`;
        return newProxy;
      });
    successfulProxies.forEach(() => incrementProxies({ provider }));
    const unsuccessfulProxies = resolvedProxyInstances.filter(
      proxy => proxy instanceof Error
    );
    if (unsuccessfulProxies.length > 0) {
      setInfoModal({
        infoModalShowing: true,
        infoModalHeader: `Errors creating ${provider} proxy`,
        infoModalBody: (
          <table className="w-100">
            <th>
              <tr>
                <td>Errors</td>
              </tr>
            </th>
            <tbody>
              {unsuccessfulProxies.map(error => (
                <tr>
                  <td>{JSON.stringify(error.message)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ),
        infoModalFunction: '',
        infoModalButtonText: ''
      });
    }
    setLoading(
      false,
      `Creating ${quantity} ${upperCaseFirst(provider)} ${
        quantity === '1' ? 'Proxy' : 'Proxies'
      }`
    );
    successfulProxies.forEach(proxy => addProxy(proxy));
  };

  deleteProxies = async () => {
    const { providerAccount, provider, region } = this.state;
    const { setLoading, clearProxies } = this.props;
    setLoading(
      true,
      `Deleting ${upperCaseFirst(provider)} Proxies on Account ${
        providerAccount.name
      }`
    );
    try {
      switch (provider) {
        case 'google':
          await deleteAllGoogleCloudInstances(providerAccount);
          break;
        case 'digitalocean':
          await deleteAllDigitalOceanInstances(providerAccount);
          break;
        case 'vultr':
          await deleteAllVultrInstances(providerAccount.apiKey);
          break;
        case 'linode':
          await deleteAllLinodeInstances(providerAccount.apiKey);
          break;
        case 'aws':
          await deleteAllAWSInstances(providerAccount, region);
          break;
        default:
          break;
      }
      clearProxies(`${provider} - ${providerAccount.name}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(
        false,
        `Deleting ${upperCaseFirst(provider)} Proxies on Account ${
          providerAccount.name
        }`
      );
    }
  };

  copyProxies = () => {
    const { toastManager, proxies } = this.props;
    try {
      copyProxies(proxies.proxies, 99999);
      toastManager.add('Proxies copied to clipboard', {
        appearance: 'success',
        autoDismiss: true,
        pauseOnHover: true
      });
    } catch (error) {
      log.error(error);
      toastManager.add('Failed to add proxies to clipboard', {
        appearance: 'error',
        autoDismiss: true,
        pauseOnHover: true
      });
    }
  };

  returnProxyInstance = index => {
    const {
      provider,
      providerAccount,
      region,
      machineType,
      proxyGroupName,
      proxyUser,
      proxyPass
    } = this.state;
    switch (provider) {
      case 'google':
        return createGoogleCloudInstance(
          providerAccount.googleCredentialsProjectID,
          providerAccount.googleCredentialsPath,
          region,
          machineType,
          proxyUser,
          proxyPass,
          `${proxyGroupName}-${index}`
        );
      case 'digitalocean':
        return createDigitalOceanInstance(
          providerAccount.apiKey,
          region,
          machineType,
          proxyUser,
          proxyPass,
          `${proxyGroupName}-${index}`
        );
      case 'vultr':
        return createVultrInstance(
          providerAccount.apiKey,
          region,
          machineType,
          proxyUser,
          proxyPass,
          `${proxyGroupName}-${index}`
        );
      case 'linode':
        return createLinodeInstance(
          providerAccount.apiKey,
          region,
          machineType,
          proxyUser,
          proxyPass,
          `${proxyGroupName}-${index}`
        );
      case 'aws':
        return createAWSInstance(
          providerAccount.awsAccessKey,
          providerAccount.awsSecretKey,
          region,
          machineType,
          proxyUser,
          proxyPass
        );
      default:
        break;
    }
  };

  render() {
    const {
      provider,
      regions,
      machineTypes,
      quantity,
      region,
      machineType,
      proxyGroupName,
      proxyUser,
      proxyPass,
      providerAccountName
    } = this.state;
    const { proxies } = this.props;
    const { settings } = this.props;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'IP',
        accessor: 'ip'
      },
      {
        Header: 'Port',
        accessor: 'port'
      },
      {
        Header: 'User',
        accessor: 'user'
      },
      {
        Header: 'Pass',
        accessor: 'pass'
      },
      {
        Header: 'Account',
        accessor: 'providerAccountID'
      },
      {
        Header: 'Ping(ms)',
        accessor: 'ping'
      }
    ];
    return (
      <Row className="h-100 p-0">
        <Col className="panel-left h-100" xs="1">
          <Container fluid className="px-0 text-center noselect">
            <Row className="px-0">
              <Col
                name="google"
                className={`proxyIcon ${
                  provider === 'google' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    draggable="false"
                    src={googlecloudLogo}
                    className="my-3"
                    alt="Google Cloud Logo"
                  />
                  <h5>Google</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                name="digitalocean"
                className={`proxyIcon ${
                  provider === 'digitalocean' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={digitaloceanLogo}
                    className="my-3"
                    draggable="false"
                    alt="DigitalOcean Logo"
                  />
                  <h5>DigitalOcean</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                name="vultr"
                className={`proxyIcon ${
                  provider === 'vultr' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={vultrLogo}
                    className="my-3"
                    draggable="false"
                    alt="Vultr Logo"
                  />
                  <h5>Vultr</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                name="linode"
                className={`proxyIcon ${
                  provider === 'linode' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={linodeLogo}
                    className="my-3"
                    draggable="false"
                    alt="Linode Logo"
                  />
                  <h5>Linode</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                name="aws"
                className={`proxyIcon ${
                  provider === 'aws' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={awsLogo}
                    className="my-3"
                    draggable="false"
                    alt="AWS Logo"
                  />
                  <h5>AWS</h5>
                </span>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100" xs="11">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: proxies.proxies,
                    columns,
                    loading: false,
                    infinite: true,
                    manualSorting: false,
                    manualFilters: false,
                    manualPagination: false,
                    disableMultiSort: true,
                    disableGrouping: true,
                    debug: false
                  }}
                />
              </Col>
            </Row>
            <Row className="pt-3 align-items-end noselect">
              <Col>
                <Label>
                  Account*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The account you wish to create proxies using."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="select"
                  name="providerAccount"
                  value={providerAccountName}
                  onChange={this.handleProviderChange}
                >
                  <option key="proxyProvider-disabled" value="disabled">
                    Select a provider
                  </option>
                  {provider !== ''
                    ? settings.proxyAccounts[provider].map(this.returnOptions)
                    : null}
                </Input>
              </Col>
              <Col>
                <Label>
                  Proxy Name*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The name of the proxies you want to create. e.g a name of 'test' will create proxies 'test-0', 'test-1', 'test-2'..."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  placeholder="proxy-group-1"
                  name="proxyGroupName"
                  value={proxyGroupName}
                  onChange={this.handleChangeTrimmed}
                />
              </Col>
              <Col>
                <Label>
                  Region*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The location of the proxies you want to create. The closer the proxies are to the location of the website's servers, the lower the ping. Shopify -> Oregon."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="select"
                  name="region"
                  value={region}
                  onChange={this.handleRegionChange}
                >
                  <option key="proxyProvider-disabled" value="disabled">
                    Select a region
                  </option>
                  {this.returnProviderOptions('region', regions)}
                </Input>
              </Col>
              <Col>
                <Label>
                  Machine*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The machine type you want to create the proxies on. If you don't have experience with this then choose the cheapest option.Google Cloud -> f1-micro."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="select"
                  name="machineType"
                  value={machineType}
                  onChange={this.handleChange}
                >
                  <option key="proxyProvider-disabled" value="disabled">
                    Select a machine
                  </option>
                  {this.returnProviderOptions('machine', machineTypes)}
                </Input>
              </Col>
              <Col>
                <Label>
                  Quantity*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="How many proxies you want to create."
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  name="quantity"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  onChange={this.handleChange}
                  value={quantity}
                />
              </Col>
            </Row>
            <Row className="py-3 align-items-end">
              <Col>
                <Label>
                  Username*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The username you want to use for authentication for proxies"
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  placeholder="user"
                  value={proxyUser}
                  name="proxyUser"
                  onChange={this.handleChangeTrimmed}
                />
              </Col>
              <Col>
                <Label>
                  Password*{' '}
                  <Tooltip
                    arrow
                    distance={20}
                    title="The password you want to use for authentication for proxies"
                  >
                    <FontAwesomeIcon icon="question-circle" />
                  </Tooltip>
                </Label>
                <Input
                  type="text"
                  placeholder="pass"
                  value={proxyPass}
                  name="proxyPass"
                  onChange={this.handleChange}
                />
              </Col>
              <Col>
                <Button className="d-block" onClick={this.createProxies}>
                  Create
                </Button>
              </Col>
              <Col>
                <Button className="d-block" onClick={this.copyProxies}>
                  Copy
                </Button>
              </Col>
              <Col>
                <Button color="danger" onClick={this.deleteProxies}>
                  Delete All
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

ProxyCreator.propTypes = {
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  setLoading: PropTypes.func.isRequired,
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired,
  incrementProxies: PropTypes.func.isRequired,
  proxies: PropTypes.shape({
    proxies: PropTypes.arrayOf(PropTypes.any)
  }).isRequired,
  addProxy: PropTypes.func.isRequired,
  clearProxies: PropTypes.func.isRequired,
  setInfoModal: PropTypes.func.isRequired
};

export default withToastManager(ProxyCreator);
