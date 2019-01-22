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
    this.compute.getZones({}, (err, regions) => {
      if (err) {
        return err;
      }
      const regionsArray = regions.map(elem => elem.id);
      this.setState({ cloudRegions: regionsArray, region: regionsArray[0] });
      this.compute.getMachineTypes({ filter: `zone eq ${regionsArray[0]}` }, (err, machineTypes) => {
        if (err) {
          return err;
        }
        const machineTypesArray = machineTypes.map(elem => elem.id);
        this.setState({ machineTypes: machineTypesArray, machine: machineTypesArray[0] });
      });
    });
  };

  initializeAmazonAWS = () => {
    this.compute = new AWS.EC2({
      accessKeyId: this.props.settings.awsAccessKey,
      secretAccessKey: this.props.settings.awsSecretKey,
      region: 'us-west-1',
      apiVersion: '2016-11-15'
    });
    this.compute.describeRegions({}, function(err, data) {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Regions: ', data.Regions);
      }
    });
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
      regionsArray.push(`${regions[key].name}-${regions[key].DCID}`);
    }
    for (const key of plansIDS) {
      if (plans[key] !== undefined) {
        plansArray.push(`${plans[key].name}-${plans[key].VPSPLANID}-$${plans[key].price_per_month}p/m`);
      }
    }
    this.setState({ cloudRegions: regionsArray, region: regionsArray[0], machineTypes: plansArray, machine: plansArray[0] });
  };

  initializeDigitalOcean = async () => {
    this.compute = new DigitalOcean(this.props.settings.digitalOceanAPIKey, 10);
    const regions = await this.compute.regionsGetAll();
    const regionsArray = regions.body.regions.map(elem => `${elem.name}-${elem.slug}`);
    this.setState({
      cloudRegions: regionsArray,
      machineTypes: regions.body.regions[1].sizes,
      region: regionsArray[0],
      machine: regions.body.regions[1].sizes[0]
    });
  };

  intializeCloudLibrary = name => {
    switch (name) {
      case 'Google Cloud':
        this.initializeGoogleCloud();
        break;
      case 'Amazon AWS':
        this.initializeAmazonAWS();
        break;
      case 'Vultr':
        this.initializeVultr();
        break;
      case 'DigitalOcean':
        this.initializeDigitalOcean();
        break;
      default:
        break;
    }
  };

  createInstance = async name => {
    switch (name) {
      case 'Google Cloud':
        Array.from(Array(parseInt(this.state.quantity))).forEach((x, i) => {
          this.createGoogleCloudInstance(i);
        });
        break;
      case 'Vultr':
        for (let i = 0; i < this.state.quantity; i++) {
          this.createVultrInstance(i);
          await new Promise(r => setTimeout(r, 1500));
        }
        break;
      case 'DigitalOcean':
        Array.from(Array(parseInt(this.state.quantity))).forEach((x, i) => {
          this.createDigitalOceanInstance(i);
        });

      default:
        break;
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
    await operation.promise();
    const [metadata] = await vm.getMetadata();
    const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
    await this.pingVM(ip, vm, `${this.state.instanceName}-${index + 1}`);
    console.log(`created succesfully`);
  };

  createDigitalOceanInstance = async index => {
    const response = await this.compute.dropletsCreate({
      name: `${this.state.instanceName}-${index}`,
      region: this.state.region.split('-')[1],
      size: this.state.machine,
      image: 'centos-7-x64',
      user_data: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${
        this.state.proxyUser
      } ${
        this.state.proxyPassword
      } &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
    });
    await this.pollDigitalOceanInstance(response.body.droplet.id);
  };

  createVultrInstance = async index => {
    try {
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
      await this.pollVultrInstance(instanceCreateResponse.SUBID, startUpScriptResponse.SCRIPTID);
    } catch (error) {
      console.log(error);
    }
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

  updateGoogleCloudMachineTypes = () => {
    this.compute.getMachineTypes({ filter: `zone eq ${this.state.region}` }, (err, machineTypes) => {
      if (err) {
        return err;
      }
      const machineTypesArray = machineTypes.map(elem => elem.id);
      this.setState({ machineTypes: machineTypesArray, machine: machineTypesArray[0] });
    });
  };

  updateVultrMachineType = async () => {
    const plansIDS = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/regions/availability?DCID=${this.state.region.split('-')[1]}`,
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
        plansArray.push(`${plans[key].name}-${plans[key].VPSPLANID}-$${plans[key].price_per_month}p/m`);
      }
    }
    this.setState({ machineTypes: plansArray, machine: plansArray[0] });
  };

  updateDigitalOceanMachineType = async () => {
    const region = this.state.region.split('-');
    const regionsResponse = await this.compute.regionsGetAll();
    const machineTypesArray = regionsResponse.body.regions.filter(elem => elem.name === this.state.region.split('-')[0])[0].sizes;
    this.setState({
      machineTypes: machineTypesArray,
      machine: machineTypesArray[0]
    });
  };

  updateMachineTypes = () => {
    switch (this.state.cloud) {
      case 'Google Cloud':
        this.updateGoogleCloudMachineTypes();
        break;
      case 'Vultr':
        this.updateVultrMachineType();
        break;
      case 'DigitalOcean':
        this.updateDigitalOceanMachineType();
        break;
    }
  };

  returnOptions = array => {
    return array.map((elem, index) => <option key={`region-${index}`}>{elem}</option>);
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
                {this.returnOptions(this.state.cloudRegions)}
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
                {this.returnOptions(this.state.machineTypes)}
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
