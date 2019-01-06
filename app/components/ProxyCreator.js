import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup, Form } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const rp = require('request-promise');
const Compute = require('@google-cloud/compute');
const request = require('request-promise');

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
      quantity: '0'
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

  intializeCloudLibrary = name => {
    switch (name) {
      case 'Google Cloud':
        this.initializeGoogleCloud();
        break;
      default:
        break;
    }
  };

  createInstance = name => {
    switch (name) {
      case 'Google Cloud':
        Array.from(Array(parseInt(this.state.quantity))).forEach((x, i) => {
          this.createGoogleCloudInstance(i);
        });
        break;
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

  updateMachineTypes = () => {
    this.compute.getMachineTypes({ filter: `zone eq ${this.state.region}` }, (err, machineTypes) => {
      if (err) {
        return err;
      }
      const machineTypesArray = machineTypes.map(elem => elem.id);
      this.setState({ machineTypes: machineTypesArray, machine: machineTypesArray[0] });
    });
  };

  returnRegions = array => {
    return array.map((elem, index) => <option key={`region-${index}`}>{elem}</option>);
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
              >
                <option />
                <option>Amazon AWS</option>
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
                {this.returnRegions(this.state.cloudRegions)}
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
                {this.returnRegions(this.state.machineTypes)}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col xs="3">
              <label>proxy username</label>
              <Input
                name="proxyUser"
                value={this.state.proxyUser}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="3">
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
            <Col xs="3" className="d-flex flex-column justify-content-end">
              <Button
                onClick={() => {
                  this.createInstance(this.state.cloud);
                }}
                className="nButton"
              >
                create
              </Button>
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
