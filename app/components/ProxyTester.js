import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
const rp = require('request-promise');

export default class ProxyTester extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proxyInput: '',
      proxyPings: [],
      proxySite: 'http://google.com'
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

  clearProxyPings = () => {
    this.setState({ proxyPings: [] });
  };

  setProxyInput = () => {
    let proxiesArray = [];
    for (const proxy of this.state.proxyPings) {
      if (proxy.user === 'none' && proxy.pass === 'none') {
        proxiesArray.push(`${proxy.ip}:${proxy.port}`);
      } else {
        proxiesArray.push(`${proxy.user}:${proxy.pass}:${proxy.ip}:${proxy.port}`);
      }
    }
    const proxiesList = proxiesArray.join('\n');
    this.setState({
      ...this.state,
      proxyInput: proxiesList
    });
  };

  async handleProxies() {
    if (this.state.proxyInput !== '') {
      const splitProxies = this.state.proxyInput.split('\n');
      console.log(splitProxies);
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

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Table responsive hover className="text-center">
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
          <Container>
            <Row>
              <Col xs="6">
                <FormGroup>
                  <Label>proxies</Label>
                  <Input
                    name="proxyInput"
                    type="textarea"
                    id="proxyInput"
                    placeholder="user:pass:ip:port or ip:port"
                    value={this.state.proxyInput}
                    onChange={event => {
                      this.handleChange(event);
                    }}
                  />
                </FormGroup>
                <FormGroup row>
                  <div className="col-sm-4 text-center">
                    <Button
                      className="nButton"
                      onClick={() => {
                        this.handleProxies();
                      }}
                    >
                      test proxies
                    </Button>
                  </div>
                  <div className="col-sm-4 text-center">
                    <Button
                      className="nButton"
                      onClick={async () => {
                        this.clearProxyPings();
                      }}
                    >
                      clear proxies
                    </Button>
                  </div>
                </FormGroup>
              </Col>
              <Col xs="6">
                <FormGroup>
                  <Label>site</Label>
                  <Input
                    name="proxySite"
                    type="text"
                    id="proxySite"
                    value={this.state.proxySite}
                    placeholder="http://google.com"
                    onChange={event => {
                      this.handleChange(event);
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
