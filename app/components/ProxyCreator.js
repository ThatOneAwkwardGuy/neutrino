import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const rp = require('request-promise');
const Compute = require('@google-cloud/compute');
const DigitalOcean = require('do-wrapper').default;
const AWS = require('aws-sdk');
const { clipboard } = require('electron');
const { session } = require('electron').remote;
const numberOfTries = 50;
const sleepTime = 2000;

export default class ProxyCreator extends Component {
  constructor(props) {
    super(props);
    this.compute = new Compute();
    this.state = {
      proxyPings: [],
      cloudRegions: [],
      machineTypes: [],
      machine: '',
      region: '',
      cloud: '',
      proxyInput: '',
      instanceName: '',
      proxyUser: '',
      proxyPassword: '',
      website: 'http://google.com',
      quantity: '1',
      deleteAllmodal: false
    };
  }

  toggleDeleteAllModal = () => {
    this.setState({
      deleteAllmodal: !this.state.deleteAllmodal
    });
  };

  returnProxyRow = (proxy, index) => (
    <tr key={`proxy-${index}`}>
      <td>{index + 1}</td>
      <td>{proxy.ip}</td>
      <td>{proxy.port}</td>
      <td>{proxy.user}</td>
      <td>{proxy.pass}</td>
      <td>{proxy.ping}</td>
    </tr>
  );

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  initializeGoogleCloud = async () => {
    this.compute = new Compute({
      projectId: this.props.settings.googleCredentialsPojectID,
      keyFilename: this.props.settings.googleCredentialsPath
    });
    const [regions] = await this.compute.getZones();
    const regionsArray = regions.map(elem => ({ name: elem.name, id: elem.id }));
    this.setState({ cloudRegions: regionsArray, region: regionsArray[0].id });
    const [machineTypes] = await this.compute.getMachineTypes({ filter: `zone eq ${regionsArray[0].id}` });
    const machineTypesArray = machineTypes.map(elem => ({ name: elem.name, id: elem.id, price: `N/A` }));
    this.setState({ machineTypes: machineTypesArray, machine: machineTypesArray[0] });
  };

  initializeVultr = async () => {
    const regions = await rp({
      method: 'GET',
      uri: 'https://api.vultr.com/v1/regions/list',
      json: true
    });
    const plansIDS = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/regions/availability?DCID=${regions[Object.keys(regions)[0]].DCID}`,
      json: true
    });
    const plans = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/plans/list`,
      json: true
    });
    const regionsArray = [];
    const plansArray = [];
    for (const key in regions) {
      regionsArray.push({ name: regions[key].name, id: regions[key].DCID });
    }
    for (const key of plansIDS) {
      if (plans[key] !== undefined) {
        plansArray.push({ name: plans[key].name, id: plans[key].VPSPLANID, price: `$${plans[key].price_per_month}/month` });
      }
    }
    this.setState({ cloudRegions: regionsArray, region: regionsArray[0].id, machineTypes: plansArray, machine: plansArray[0] });
  };

  initializeDigitalOcean = async () => {
    this.compute = new DigitalOcean(this.props.settings.digitalOceanAPIKey, 10);
    const regions = await this.compute.regionsGetAll();
    const regionsArray = regions.body.regions.map(elem => ({ name: elem.name, id: elem.slug }));
    const sizesArray = await this.compute.sizesGetAll();
    const sizes = sizesArray.body.sizes.map(elem => ({ id: elem.slug, name: elem.slug, price: `$${elem.price_hourly.toFixed(2)}/hr` }));
    this.setState({
      cloudRegions: regionsArray,
      machineTypes: sizes,
      region: regionsArray[0].id,
      machine: regions.body.regions[1].sizes[0]
    });
  };

  intializeCloudLibrary = async name => {
    this.props.setLoading(`Loading ${name} API`, true, false);
    this.setState({
      cloudRegions: [],
      machineTypes: []
    });
    try {
      switch (name) {
        case 'Google Cloud':
          await this.initializeGoogleCloud();
          break;
        case 'Vultr':
          await this.initializeVultr();
          break;
        case 'DigitalOcean':
          await this.initializeDigitalOcean();
          break;
        case 'AWS':
          await this.initialiseAWS();
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      this.props.changeInfoModal(true, `Error Loading ${name} API`, error.message, '');
    } finally {
      this.props.setLoading('', false, false);
    }
  };

  initialiseAWS = async () => {
    AWS.config.update({ accessKeyId: 'AKIAJZY5QY7YVV7OI32Q', secretAccessKey: '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', region: 'us-east-1' });
    var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
    var params = {};
    const AWSregions = await new Promise((resolve, reject) => {
      ec2.describeRegions(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Regions);
        }
      });
    });
    const regions = AWSregions.map(region => ({ id: region.RegionName, name: region.RegionName }));
    this.setState({
      cloudRegions: regions,
      machineTypes: [
        { name: 't3.nano', id: 't3.nano', price: '$0.0073/hr' },
        { name: 't3.micro', id: 't3.micro', price: '$0.0146/hr' },
        { name: 't3.small', id: 't3.small', price: '$0.0292/hr' },
        { name: 't3.medium', id: 't3.medium', price: '$0.0584/hr' }
      ],
      region: 'us-east-1',
      machine: 't3.nano'
    });
  };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  createInstance = async name => {
    try {
      this.props.setLoading(`Creating Proxies On ${name}`, true, false);
      let instances = [];
      switch (name) {
        case 'Google Cloud':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return this.createGoogleCloudInstance(i).catch(e => e);
          });
          break;
        case 'Vultr':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return Promise.resolve(this.sleep(1500 * i)).then(() => {
              return this.createVultrInstance(i).catch(e => e);
            });
          });
          break;
        case 'DigitalOcean':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return this.createDigitalOceanInstance(i).catch(e => e);
          });
        case 'AWS':
          instances = this.createAmazonInstances(this.state.quantity);
        default:
          break;
      }
      const resolvedInstances = await Promise.all(instances);
      const invalidResults = resolvedInstances.filter(result => result !== undefined);
      console.log(invalidResults);
      if (invalidResults.length > 0) {
        this.props.changeInfoModal(
          true,
          `Error Creating Proxies On ${name}`,
          <Table>
            <thead>
              <tr>
                <th>Error Name</th>
                <th>Error Message</th>
              </tr>
            </thead>
            <tbody>
              {invalidResults.map((error, index) => {
                return (
                  <tr key={`error-${index}`}>
                    <td>{'Error'}</td>
                    <td style={{ wordBreak: 'break-word' }}>{error.message ? error.message : JSON.stringify(error)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      }
    } catch (error) {
      console.log(error);
      this.props.changeInfoModal(
        true,
        `Error Creating Proxies On ${name}`,
        `There was an error creating the proxies on ${name}, please check you internet connection, try again or ocntact support.`,
        ''
      );
    } finally {
      this.props.setLoading('', false, false);
    }
  };

  pingVM = async (ip, vm) => {
    let exit = false;
    let res;
    let count = 0;
    while (!exit && count <= numberOfTries) {
      count++;
      try {
        res = await rp({
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
          },
          uri: this.state.website,
          time: true,
          proxy: `http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`,
          resolveWithFullResponse: true,
          followAllRedirects: true
        });
        const stringStatusCode = String(res.statusCode);
        if (stringStatusCode.slice(0, 1) !== '2' && stringStatusCode.slice(0, 1) !== '3') {
          vm.delete();
          throw new Error(res.statusCode);
        }
        exit = true;
      } catch (err) {
        console.log(err);
        if (err.error.code !== 'ECONNREFUSED' && err.error.code !== 'ETIMEDOUT') {
          const split = [this.state.proxyUser, this.state.proxyPassword, ip, '3128'];
          this.setState({
            proxyPings: [
              ...this.state.proxyPings,
              {
                user: split[0],
                pass: split[1],
                ip: split[2],
                port: split[3],
                ping: -1
              }
            ]
          });
          exit = true;
          throw err;
        }
      }
      await this.sleep(sleepTime);
    }
    if (count > numberOfTries) {
      vm.delete();
      throw new Error(`After ${numberOfTries} attempts, the proxy that was made could not be connected to and was deleted.`);
    }
    const split = [this.state.proxyUser, this.state.proxyPassword, ip, '3128'];
    this.setState({
      proxyPings: [
        ...this.state.proxyPings,
        {
          user: split[0],
          pass: split[1],
          ip: split[2],
          port: split[3],
          ping: Math.round(res.timings.response)
        }
      ]
    });
  };

  createGoogleCloudInstance = async index => {
    const zone = this.compute.zone(this.state.region);
    const config = {
      os: 'centos-7',
      http: true,
      https: true,
      tags: ['neutrinoproxies'],
      machineType: this.state.machineType,
      canIpForward: true,
      metadata: {
        items: [
          {
            key: 'startup-script',
            value: `#!/bin/bash
            yum install squid wget httpd-tools openssl openssl-devel -y &&
            touch /etc/squid/passwd &&
            htpasswd -b /etc/squid/passwd ${this.state.proxyUser} ${this.state.proxyPassword} &&
            wget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&
            touch /etc/squid/blacklist.acl &&
            systemctl restart squid.service && systemctl enable squid.service &&
            iptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&
            iptables-save`
          }
        ]
      }
    };
    const vm = zone.vm(`${this.state.instanceName}-${index + 1}`);
    const [, operation] = await vm.create(config);
    console.log(operation);
    await operation.promise();
    const [metadata] = await vm.getMetadata();
    console.log(metadata);
    const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
    console.log(ip);
    return this.pingVM(ip, vm);
  };

  createDigitalOceanInstance = async index => {
    const response = await this.compute.dropletsCreate({
      name: `${this.state.instanceName}-${index}`,
      region: this.state.region,
      size: this.state.machine,
      image: 'centos-7-x64',
      user_data: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${
        this.state.proxyUser
      } ${
        this.state.proxyPassword
      } &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
    });
    return this.pollDigitalOceanInstance(response.body.droplet.id);
  };

  createAmazonInstances = async () => {
    if (this.state.region !== 'us-east-1') {
      AWS.config.update({ region: this.state.region });
    }
    const instanceParams = {
      ImageId: 'ami-e30b829d',
      InstanceType: this.state.machine,
      MinCount: this.state.quantity,
      MaxCount: this.state.quantity,
      TagSpecifications: [{ Tags: [{ Key: 'neutrinotools', value: 'neutrinotools' }], ResourceType: 'instance' }],
      UserData: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${
        this.state.proxyUser
      } ${
        this.state.proxyPassword
      } &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
    };
    const instancePromise = await new AWS.EC2({ apiVersion: '2016-11-15' }).runInstances(instanceParams).promise();
    console.log(instancePromise);
  };

  createVultrInstance = async index => {
    const startUpScriptResponse = await rp({
      method: 'POST',
      uri: 'https://api.vultr.com/v1/startupscript/create',
      headers: {
        'API-Key': this.props.settings.vultrAPIKey
      },
      json: true,
      form: {
        name: index,
        script: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${
          this.state.proxyUser
        } ${
          this.state.proxyPassword
        } &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
      }
    });
    const instanceCreateResponse = await rp({
      method: 'POST',
      uri: 'https://api.vultr.com/v1/server/create',
      headers: {
        'API-Key': this.props.settings.vultrAPIKey
      },
      json: true,
      form: {
        DCID: parseInt(this.state.region),
        VPSPLANID: parseInt(this.state.machine),
        OSID: 167,
        SCRIPTID: startUpScriptResponse.SCRIPTID,
        hostname: `${this.state.instanceName}-${index}`,
        label: `${this.state.instanceName}-${index}`
      }
    });
    return this.pollVultrInstance(instanceCreateResponse.SUBID, startUpScriptResponse.SCRIPTID);
  };

  pollVultrInstance = async (SUBID, SCRIPTID) => {
    let tryNumber = 0;
    let exit = false;
    let ip = '';
    while (!exit && tryNumber <= numberOfTries) {
      try {
        tryNumber++;
        const instanceResponse = await rp({
          method: 'GET',
          uri: `https://api.vultr.com/v1/server/list?SUBID=${SUBID}`,
          headers: {
            'API-Key': this.props.settings.vultrAPIKey
          },
          json: true
        });
        if (instanceResponse.status === 'active') {
          ip = instanceResponse.main_ip;
          exit = true;
        }
      } catch (error) {
        console.log(error);
        throw new Error('There was a problem creating your Vultr proxy instance, please check your account and delete it if it exists.');
      }
      await this.sleep(sleepTime);
    }
    if (tryNumber > numberOfTries) {
      rp({
        method: 'POST',
        uri: 'https://api.vultr.com/v1/startupscript/destroy',
        headers: {
          'API-Key': this.props.settings.vultrAPIKey
        },
        json: true,
        form: {
          SCRIPTID
        }
      });
      throw new Error('After 20 attempts, the proxy that was made could not be connected to and was deleted.');
    }
    const getWebsite = await this.pollWebsiteWithIP(`http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`);
    if (getWebsite) {
      const split = [this.state.proxyUser, this.state.proxyPassword, ip, '3128'];
      this.setState({
        proxyPings: [
          ...this.state.proxyPings,
          {
            user: split[0],
            pass: split[1],
            ip: split[2],
            port: split[3],
            ping: Math.round(getWebsite.timings.response)
          }
        ]
      });
    } else {
      rp({
        method: 'POST',
        uri: 'https://api.vultr.com/v1/startupscript/destroy',
        headers: {
          'API-Key': this.props.settings.vultrAPIKey
        },
        json: true,
        form: {
          SCRIPTID
        }
      });
      throw new Error('There was an error creating the Vultr proxy and it has been destroyed. Please check your account to makesure it has been.');
    }
  };

  pollDigitalOceanInstance = async id => {
    let tryNumber = 0;
    let exit = false;
    let ip = '';
    while (!exit && tryNumber <= numberOfTries) {
      try {
        tryNumber++;
        const instanceResponse = await this.compute.dropletsGetById(id);
        if (instanceResponse.body.droplet.status === 'active') {
          ip = instanceResponse.body.droplet.networks.v4[0].ip_address;
          exit = true;
        }
      } catch (error) {
        console.log(error);
      }
      await this.sleep(sleepTime);
    }
    if (tryNumber > numberOfTries) {
      throw new Error('There was an error creating a DigitalOcean proxy, check your account to makesure the instance is deleted');
    }
    const getWebsite = await this.pollWebsiteWithIP(`http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`);
    if (getWebsite) {
      const split = [this.state.proxyUser, this.state.proxyPassword, ip, '3128'];
      this.setState({
        proxyPings: [
          ...this.state.proxyPings,
          {
            user: split[0],
            pass: split[1],
            ip: split[2],
            port: split[3],
            ping: Math.round(getWebsite.timings.response)
          }
        ]
      });
    } else {
      this.compute.dropletsDelete(id);
      throw new Error('There was an error creating the DigitalOcean proxy and it has been destroyed. Please check your account to makesure it has been.');
    }
  };

  pollWebsiteWithIP = async ip => {
    let tryNumber = 0;
    let exit = false;
    while (!exit && tryNumber <= numberOfTries) {
      try {
        tryNumber++;
        const getWebsite = await rp({
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
          },
          uri: this.state.website,
          time: true,
          proxy: ip,
          resolveWithFullResponse: true
        });
        if (getWebsite.statusCode === 200) {
          exit = true;
          return getWebsite;
        }
      } catch (err) {
        console.log(err);
        if (err.error.code !== 'ECONNREFUSED' && String(err.error.code)[0] !== 2 && String(err.error.code)[0] !== 3) {
          exit = true;
          return false;
        }
      }
      await this.sleep(sleepTime);
    }
    return false;
  };

  updateGoogleCloudMachineTypes = async () => {
    const [machineTypes] = await this.compute.getMachineTypes({ filter: `zone eq ${this.state.region}` });
    const machineTypesArray = machineTypes.map(elem => ({ id: elem.id, name: elem.name, price: 'N/A' }));
    this.setState({ machineTypes: machineTypesArray, machine: machineTypesArray[0] });
  };

  updateVultrMachineType = async () => {
    const plansIDS = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/regions/availability?DCID=${this.state.region}`,
      json: true
    });
    const plans = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/plans/list`,
      json: true
    });
    const plansArray = [];
    for (const key of plansIDS) {
      if (plans[key] !== undefined) {
        plansArray.push({ name: plans[key].name, id: plans[key].VPSPLANID, price: `$${plans[key].price_per_month}/month` });
      }
    }
    this.setState({ machineTypes: plansArray, machine: plansArray[0].id });
  };

  updateDigitalOceanMachineType = async () => {
    const regions = await this.compute.regionsGetAll();
    const regionsArray = regions.body.regions.map(elem => ({ name: elem.name, id: elem.slug }));
    const sizesArray = await this.compute.sizesGetAll();
    const sizes = sizesArray.body.sizes.map(elem => ({ id: elem.slug, name: elem.slug, price: `$${elem.price_hourly.toFixed(2)}/hr` }));
    this.setState({
      cloudRegions: regionsArray,
      machineTypes: sizes,
      region: regionsArray[0].id,
      machine: regions.body.regions[1].sizes[0]
    });
  };

  updateMachineTypes = async () => {
    try {
      this.props.setLoading(`Loading ${this.state.cloud} Machines`, true, false);
      switch (this.state.cloud) {
        case 'Google Cloud':
          await this.updateGoogleCloudMachineTypes();
          break;
        case 'Vultr':
          await this.updateVultrMachineType();
          break;
        case 'DigitalOcean':
          await this.updateDigitalOceanMachineType();
          break;
      }
    } catch (error) {
      console.log(error);
      this.props.changeInfoModal(true, `Error Loading ${name} Machines`, error.message, '');
    } finally {
      this.props.setLoading('', false, false);
    }
  };

  returnOptions = (name, array) => {
    if (name === 'region') {
      return array.map((elem, index) => (
        <option value={elem.id} key={`region-${index}`}>
          {elem.name}
        </option>
      ));
    } else if (name === 'machine') {
      return array.map((elem, index) => (
        <option value={elem.id} key={`region-${index}`}>
          {elem.name} - {elem.price}
        </option>
      ));
    }
  };

  copyToClipboard = () => {
    let string = '';
    this.state.proxyPings.forEach(elem => {
      string += `${elem.user}:${elem.pass}:${elem.ip}:${elem.port}\n`;
    });
    clipboard.writeText(string, 'selection');
  };

  deleteAllProxies = async () => {
    let responses;
    try {
      this.toggleDeleteAllModal();
      this.props.setLoading(`Deleting ${this.state.cloud} Proxies`, true, false);
      switch (this.state.cloud) {
        case 'Google Cloud':
          responses = await this.deleteAllGoogleCloudProxies();
          break;
        case 'DigitalOcean':
          responses = await this.deleteAllDigitalOceanProxies();
          break;
        case 'Vultr':
          responses = await this.deleteAllVultrProxies();
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.props.setLoading('', false, false);
      const errors = responses.filter(response => response instanceof Error);
      if (errors.length > 0) {
        this.props.changeInfoModal(
          true,
          'Error Deleting',
          'There was an error deleting some proxies in your account, please check manually to make sure they were deleted',
          ''
        );
      }
      this.setState({ proxyPings: [] });
    }
  };

  deleteAllDigitalOceanProxies = async () => {
    const response = await this.compute.dropletsGetAll();
    const droplets = response.body.droplets;
    const dropletDeletePromises = [];
    droplets.forEach(droplet => {
      dropletDeletePromises.push(this.compute.dropletsDelete(droplet.id).catch(e => e));
    });
    return Promise.all(dropletDeletePromises);
  };

  deleteAllGoogleCloudProxies = async () => {
    const vms = await this.compute.getVMs();
    const vmsDeletePromises = [];
    console.log(vms);
    vms[0].forEach(vm => {
      if (vm.metadata.tags.items.includes('neutrinoproxies')) {
        vmsDeletePromises.push(vm.delete().catch(e => e));
      }
    });
    console.log(vmsDeletePromises);
    return Promise.all(vmsDeletePromises);
  };

  deleteAllVultrProxies = async () => {
    const response = await rp({
      method: 'GET',
      uri: 'https://api.vultr.com/v1/server/list',
      headers: {
        'API-Key': this.props.settings.vultrAPIKey
      },
      json: true
    });
    const SUBIDs = Object.keys(response);
    const SUBIDsDeletePromises = [];
    SUBIDs.forEach(SUBID => {
      SUBIDsDeletePromises.push(
        rp({
          method: 'POST',
          uri: 'https://api.vultr.com/v1/server/destroy',
          headers: {
            'API-Key': this.props.settings.vultrAPIKey
          },
          json: true,
          body: {
            SUBID
          }
        }).catch(e => e)
      );
    });
    return Promise.all(SUBIDsDeletePromises);
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">
            <Table responsive hover className="text-center col-12">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ip</th>
                  <th>port</th>
                  <th>user</th>
                  <th>pass</th>
                  <th>ping(ms)</th>
                </tr>
              </thead>
              <tbody>{this.state.proxyPings.map(this.returnProxyRow)}</tbody>
            </Table>
          </Row>
          <FormGroup row>
            <Col xs="2">
              <label>Cloud Service*</label>
              <Input
                name="cloud"
                type="select"
                onChange={e => {
                  this.handleChange(e);
                  this.intializeCloudLibrary(e.target.value);
                }}
                defaultValue="select provider"
              >
                <option disabled>select provider</option>
                <option>Google Cloud</option>
                {/* <option>AWS</option> */}
                <option>Vultr</option>
                <option>DigitalOcean</option>
              </Input>
            </Col>
            <Col xs="2">
              <label>Name*</label>
              <Input
                name="instanceName"
                type="text"
                value={this.state.instanceName}
                onChange={e => {
                  e.target.value = e.target.value.toLocaleLowerCase().replace(' ', '-');
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2">
              <label>Quantity*</label>
              <Input
                type="select"
                name="quantity"
                value={this.state.quantity}
                onChange={e => {
                  this.handleChange(e);
                }}
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
              </Input>
            </Col>
            <Col xs="3">
              <label>Region*</label>
              <Input
                name="region"
                onChange={e => {
                  this.handleChange(e);
                  this.updateMachineTypes(e.target.value);
                }}
                type="select"
              >
                {this.returnOptions('region', this.state.cloudRegions)}
              </Input>
            </Col>
            <Col xs="3">
              <label>Machine*</label>
              <Input
                name="machine"
                onChange={e => {
                  this.handleChange(e);
                }}
                type="select"
              >
                {this.returnOptions('machine', this.state.machineTypes)}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col xs="2">
              <label>Proxy Username*</label>
              <Input
                name="proxyUser"
                value={this.state.proxyUser}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2">
              <label>Proxy Password*</label>
              <Input
                name="proxyPassword"
                value={this.state.proxyPassword}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2">
              <label>Website*</label>
              <Input
                name="website"
                value={this.state.website}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2" className="d-flex flex-column justify-content-end">
              <Button
                onClick={() => {
                  this.createInstance(this.state.cloud);
                }}
                className="nButton"
              >
                Create
              </Button>
            </Col>
            <Col xs="2" className="d-flex flex-column justify-content-end">
              <Button
                onClick={() => {
                  this.copyToClipboard();
                }}
                className="nButton"
              >
                Copy All
              </Button>
            </Col>
            <Col xs="2" className="d-flex flex-column justify-content-end">
              <Button
                color="danger"
                onClick={() => {
                  if (this.state.cloud !== '') {
                    this.toggleDeleteAllModal();
                  }
                }}
              >
                Delete All
              </Button>
            </Col>
          </FormGroup>
          <Modal isOpen={this.state.deleteAllmodal} toggle={this.toggleDeleteAllModal} centered>
            <ModalHeader style={{ borderBottom: 'none' }}>Are You Sure?</ModalHeader>
            <ModalBody>{`Are you sure you want to delete all proxies in your ${this.state.cloud} Account?`}</ModalBody>
            <ModalFooter>
              <Button className="nButton" onClick={this.toggleDeleteAllModal}>
                Cancel
              </Button>
              <Button color="danger" onClick={this.deleteAllProxies}>
                Delete All
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </CSSTransition>
    );
  }
}
