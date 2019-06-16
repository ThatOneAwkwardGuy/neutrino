import React, { Component } from 'react';
import { Row, Col, Button, Table, Container, Input, Label, FormGroup, Form } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import ReactTable from 'react-table';
const rp = require('request-promise');
const { clipboard } = require('electron');

export default class ProxyTester extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proxyInput: '',
      proxyPings: [],
      proxySite: 'http://google.com',
      minPing: 0,
      maxPing: 100
    };
  }

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

  copyWorkingProxies = () => {
    let proxies = [...this.state.proxyPings];
    proxies = proxies.filter(proxy => proxy.ping >= this.state.minPing && proxy.ping <= this.state.maxPing);
    const proxyString = proxies
      .map(proxy => {
        if (proxy.user !== 'none' && proxy.pass !== 'none') {
          return `${proxy.user}:${proxy.pass}:${proxy.ip}:${proxy.port}`;
        } else {
          return `${proxy.ip}:${proxy.port}`;
        }
      })
      .join('\n');
    clipboard.writeText(proxyString, 'selection');
  };

  async handleProxies() {
    if (this.state.proxyInput !== '') {
      try {
        this.props.setLoading('Testing Proxies', true, false);
        const splitProxies = this.state.proxyInput.split('\n');
        this.setState({
          proxyPings: []
        });
        const proxiesPromises = splitProxies.map(async proxyItem => {
          const split = proxyItem.split(':');
          try {
            const responsePing = await rp({
              headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
              },
              method: 'GET',
              time: true,
              resolveWithFullResponse: true,
              uri: this.state.proxySite,
              proxy: split.length === 4 ? `http://${split[0]}:${split[1]}@${split[2]}:${split[3]}` : split.length === 2 ? `http://${split[0]}:${split[1]}` : ''
            });
            console.log(proxyItem);
            console.log(responsePing.timings);
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
                    ping: -1
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
                    ping: -1
                  }
                ]
              });
            }
          }
        });
        await Promise.all(proxiesPromises);
        this.props.setLoading('', false, false);
      } catch (error) {
        this.props.changeInfoModal(true, `Error Checking Proxies`, 'There was an error checking the proxies you entered', '');
      } finally {
        this.props.setLoading('', false, false);
      }
    }
  }

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Container fluid className="activeWindow d-flex flex-column">
          <Row className="flex-grow-1">
            <ReactTable
              className="proxyTesterTable"
              showPagination={false}
              showPageSizeOptions={false}
              noDataText="no proxies added"
              data={this.state.proxyPings}
              columns={[
                {
                  Header: 'ip',
                  accessor: 'ip'
                },
                {
                  Header: 'port',
                  accessor: 'port'
                },
                {
                  Header: 'user',
                  accessor: 'user'
                },
                {
                  Header: 'pass',
                  accessor: 'pass'
                },
                {
                  Header: 'ping (ms)',
                  accessor: 'ping'
                }
              ]}
            />
          </Row>
          <FormGroup row>
            <Col xs="6">
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
            </Col>
            {/* <Col xs="2">
                <Label>min ping (ms)</Label>
                <Input
                  name="minPing"
                  min="0"
                  type="number"
                  id="minPing"
                  value={this.state.minPing}
                  placeholder="0"
                  onChange={event => {
                    this.handleChange(event);
                  }}
                />
              </Col> */}
            <Col xs="2">
              <Label>max ping (ms)</Label>
              <Input
                name="maxPing"
                min="0"
                type="number"
                id="maxPing"
                value={this.state.maxPing}
                placeholder="20"
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="2" className="text-center d-flex flex-column justify-content-end">
              <Label />
              <Button
                className="nButton"
                onClick={async () => {
                  this.copyWorkingProxies();
                }}
              >
                copy proxies
              </Button>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col xs="6">
              <Label>proxies</Label>
              <Input
                name="proxyInput"
                type="textarea"
                id="proxyInput"
                placeholder="user:pass:ip:port or ip:port (new line per proxy)"
                value={this.state.proxyInput}
                onChange={event => {
                  this.handleChange(event);
                }}
              />
            </Col>
            <Col xs="3" className="text-center d-flex flex-column justify-content-end">
              <Button
                className="nButton"
                onClick={() => {
                  this.handleProxies();
                }}
              >
                test proxies
              </Button>
            </Col>
            <Col xs="3" className="text-center d-flex flex-column justify-content-end">
              <Button
                className="nButton"
                onClick={async () => {
                  this.clearProxyPings();
                }}
              >
                clear proxies
              </Button>
            </Col>
          </FormGroup>
        </Container>
      </CSSTransition>
    );
  }
}
