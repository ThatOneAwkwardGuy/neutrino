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
      googleCloudRegions: [],
      region: '',
      cloud: '',
      proxyInput: '',
      instanceName: '',
      proxyUser: '',
      proxyPassword: '',
      website: 'http://google.com'
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
      console.log(regions);
      const regionsArray = regions.map(elem => elem.id);
      this.setState({ googleCloudRegions: regionsArray, region: regionsArray[0] });
    });
  };

  async handleProxies() {
    if (this.state.proxyInput !== '') {
      const splitProxies = this.state.proxyInput.split('\n');
      this.setState({
        proxyPings: []
      });
      splitProxies.forEach(async proxyItem => {
        const split = proxyItem.split(':');
        try {
          const responsePing = await rp({
            method: 'GET',
            time: true,
            resolveWithFullResponse: true,
            uri: this.state.proxySite,
            proxy: split.length === 4 ? `http://${split[0]}:${split[1]}@${split[2]}:${split[3]}` : split.length === 2 ? `http://${split[0]}:${split[1]}` : ''
          });
          if (split.length === 4) {
            this.setState({
              proxyPings: [
                ...this.state.proxyPings,
                {
                  user: split[0],
                  pass: split[1],
                  ip: split[2],
                  port: split[3],
                  ping: Math.round(responsePing.timings.response)
                }
              ]
            });
          } else if (split.length === 2) {
            this.setState({
              proxyPings: [
                ...this.state.proxyPings,
                {
                  user: 'none',
                  pass: 'none',
                  ip: split[0],
                  port: split[1],
                  ping: Math.round(responsePing.timings.response)
                }
              ]
            });
          }
        } catch (e) {
          console.log(e);
          if (split.length === 4) {
            this.setState({
              proxyPings: [
                ...this.state.proxyPings,
                {
                  user: split[0],
                  pass: split[1],
                  ip: split[2],
                  port: split[3],
                  ping: 'error'
                }
              ]
            });
          } else if (split.length === 2) {
            this.setState({
              proxyPings: [
                ...this.state.proxyPings,
                {
                  user: 'none',
                  pass: 'none',
                  ip: split[0],
                  port: split[1],
                  ping: 'error'
                }
              ]
            });
          }
        }
      });
    }
  }

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
        this.createGoogleCloudInstance();
        break;
      default:
        break;
    }
  };

  pingVM = async ip => {
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

  createGoogleCloudInstance = async () => {
    const zone = this.compute.zone(this.state.region);
    const config = {
      os: 'centos-7',
      http: true,
      metadata: {
        items: [
          {
            key: 'startup-script',
            value: `#!/bin/bash
            yum install squid wget httpd-tools openssl openssl-devel -y &&
            touch /etc/squid/passwd &&
            htpasswd -b /etc/squid/passwd admin photon123 &&
            wget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&
            touch /etc/squid/blacklist.acl &&
            systemctl restart squid.service && systemctl enable squid.service &&
            iptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&
            iptables-save`
          }
        ]
      }
    };
    const vm = zone.vm(this.state.instanceName);
    const [, operation] = await vm.create(config);
    await operation.promise();
    const [metadata] = await vm.getMetadata();
    const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
    await this.pingVM(ip);
    console.log(`created succesfully`);
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
              <Input type="select">
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
            <Col xs="4">
              <label>instance type</label>
              <Input
                name="region"
                onChange={e => {
                  this.handleChange(e);
                }}
                type="select"
              >
                {this.returnRegions(this.state.googleCloudRegions)}
              </Input>
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
          </FormGroup>
          <FormGroup row>
            <Col xs="4">
              <label>proxy username</label>
              <Input
                name="proxyUser"
                value={this.state.proxyUser}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="4">
              <label>proxy password</label>
              <Input
                name="proxyPassword"
                value={this.state.proxyPassword}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
            <Col xs="4">
              <label>website</label>
              <Input
                name="website"
                value={this.state.website}
                onChange={e => {
                  this.handleChange(e);
                }}
              />
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
