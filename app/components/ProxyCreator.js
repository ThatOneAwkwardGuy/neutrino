import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup, Form } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const rp = require('request-promise');
const Compute = require('@google-cloud/compute');
const AWS = require('aws-sdk');
const DigitalOcean = require('do-wrapper').default;
const { clipboard } = require('electron');

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
      quantity: '1'
    };
  }

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
    this.props.setLoading(`Loading ${name} API`, true);
    this.setState({
      cloudRegions: [],
      machineTypes: []
    });
    try {
      switch (name) {
        case 'Google Cloud':
          await this.initializeGoogleCloud();
          break;
        case 'Amazon AWS':
          await this.initializeAmazonAWS();
          break;
        case 'Vultr':
          await this.initializeVultr();
          break;
        case 'DigitalOcean':
          await this.initializeDigitalOcean();
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      this.props.changeInfoModal(true, `Error Loading ${name} API`, error.message, '');
    } finally {
      this.props.setLoading('', false);
    }
  };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  createInstance = async name => {
    try {
      this.props.setLoading(`Creating Proxies On ${name}`, true);
      let instances = [];
      switch (name) {
        case 'Google Cloud':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return this.createGoogleCloudInstance(i).catch(e => e);
          });
          break;
        case 'Vultr':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return new Promise(r => setTimeout(r(this.createVultrInstance(i).catch(e => e)), 1500 * i));
          });
          // for (let i = 0; i < this.state.quantity; i++) {
          //   this.createVultrInstance(i);
          //   await new Promise(r => setTimeout(r, 1500));
          // }
          break;
        case 'DigitalOcean':
          instances = Array.from(Array(parseInt(this.state.quantity))).map((x, i) => {
            return this.createDigitalOceanInstance(i).catch(e => e);
          });
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
                if (error.constructor.name === 'ApiError') {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.errors[0].reason}</td>
                      <td>{error.errors[0].message}</td>
                    </tr>
                  );
                } else if (error instanceof Error) {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.name}</td>
                      <td>{error.error}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={`error-${index}`}>
                      <td>{error.id}</td>
                      <td>{error.message}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </Table>
        );
      }
    } catch (error) {
      this.props.changeInfoModal(
        true,
        `Error Creating Proxies On ${name}`,
        `There was an error creating the proxies on ${name}, please check you internet connection, try again or ocntact support.`,
        ''
      );
    } finally {
      this.props.setLoading('', false);
    }
  };

  pingVM = async (ip, zone, instanceName) => {
    let exit = false;
    let res;
    while (!exit) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        res = await rp({
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
          },
          uri: this.state.website,
          time: true,
          proxy: `http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`,
          resolveWithFullResponse: true
        });
        console.log(res);
        if (res.statusCode !== 200) {
          zone.vm(instanceName).delete();
          throw new Error(res.statusCode);
        }
        exit = true;
      } catch (err) {
        console.log(err);
      }
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
    return this.pingVM(ip, vm, `${this.state.instanceName}-${index + 1}`);
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
        DCID: parseInt(this.state.region.split('-')[1]),
        VPSPLANID: parseInt(this.state.machine.split('-')[1]),
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
    while (tryNumber < 100 && !exit) {
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
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    const getWebsite = await this.pollWebsiteWithIP(`http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`, SCRIPTID);
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
    }
  };

  pollDigitalOceanInstance = async id => {
    let tryNumber = 0;
    let exit = false;
    let ip = '';
    while (tryNumber < 100 && !exit) {
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
      await new Promise(r => setTimeout(r, 2000));
    }
    const getWebsite = await this.pollWebsiteWithIP(`http://${this.state.proxyUser}:${this.state.proxyPassword}@${ip}:3128`, '');
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
    }
  };

  pollWebsiteWithIP = async (ip, SCRIPTID) => {
    let tryNumber = 0;
    let exit = false;
    while (tryNumber < 10 && !exit) {
      try {
        tryNumber++;
        const getWebsite = await rp({
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
          },
          uri: this.state.website,
          time: true,
          proxy: ip,
          resolveWithFullResponse: true
        });
        if (getWebsite.statusCode === 200) {
          exit = true;
          if (this.state.cloud === 'Vultr') {
            await rp({
              method: 'POST',
              uri: 'https://api.vultr.com/v1/startupscript/destroy',
              headers: {
                'API-Key': this.props.settings.vultrAPIKey
              },
              json: true,
              form: {
                SCRIPTID: SCRIPTID
              }
            });
          }
          return getWebsite;
        }
      } catch (error) {
        console.log(error);
      }
      await new Promise(r => setTimeout(r, 5000));
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
    this.setState({ machineTypes: plansArray, machine: plansArray[0] });
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
      this.props.setLoading(`Loading ${this.state.cloud} Machines`, true);
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
      this.props.setLoading('', false);
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
      string += `${elem.user}:${elem.pass}@${elem.ip}:${elem.port}\n`;
    });
    clipboard.writeText(string, 'selection');
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
                  <th>ping</th>
                </tr>
              </thead>
              <tbody>{this.state.proxyPings.map(this.returnProxyRow)}</tbody>
            </Table>
          </Row>
          <FormGroup row>
            <Col xs="2">
              <label>cloud service</label>
              <Input
                name="cloud"
                type="select"
                onChange={e => {
                  this.handleChange(e);
                  this.intializeCloudLibrary(e.target.value);
                }}
                defaultValue="select a provider"
              >
                <option disabled>select a provider</option>
                {/* <option>Amazon AWS</option> */}
                <option>Google Cloud</option>
                <option>Vultr</option>
                <option>DigitalOcean</option>
              </Input>
            </Col>
            <Col xs="2">
              <label>name</label>
              <Input
                name="instanceName"
                type="text"
                value={this.state.instanceName}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2">
              <label>quantity</label>
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
              <label>region</label>
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
              <label>machine</label>
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
              <label>proxy username</label>
              <Input
                name="proxyUser"
                value={this.state.proxyUser}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="2">
              <label>proxy password</label>
              <Input
                name="proxyPassword"
                value={this.state.proxyPassword}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="3">
              <label>website</label>
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
                create
              </Button>
            </Col>
            <Col xs="3" className="d-flex flex-column justify-content-end">
              <Button
                onClick={() => {
                  this.copyToClipboard();
                }}
                className="nButton"
              >
                copy to clipboard
              </Button>
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
