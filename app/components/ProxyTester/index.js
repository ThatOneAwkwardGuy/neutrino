import React, { Component } from 'react';
import { Container, Row, Col, Input, Label, Button } from 'reactstrap';
import { withToastManager } from 'react-toast-notifications';
import { Tooltip } from 'react-tippy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PropTypes from 'prop-types';

import { testProxy, copyProxies } from './functions';

import Table from '../Table';

const log = require('electron-log');

class ProxyTester extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proxies: [],
      order: 'asc',
      orderBy: '#',
      proxyInput: '',
      proxySite: 'http://google.com',
      maxPing: 1000
    };
  }

  handleSort = (event, property) => {
    const { orderBy, order } = this.state;
    const isDesc = orderBy === property && order === 'desc';
    this.setState({
      order: isDesc ? 'asc' : 'desc',
      orderBy: property
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  copyWorkingProxies = () => {
    const { proxies, maxPing } = this.state;
    const { toastManager } = this.props;
    try {
      toastManager.add('Proxies copied to clipboard', {
        appearance: 'success',
        autoDismiss: true,
        pauseOnHover: true
      });
      copyProxies(proxies, maxPing);
    } catch (error) {
      log.error(error);
      toastManager.add('Failed to add proxies to clipboard', {
        appearance: 'error',
        autoDismiss: true,
        pauseOnHover: true
      });
    }
  };

  clearProxies = () => {
    this.setState({ proxies: [] });
  };

  testProxies = async () => {
    const { setLoading } = this.props;
    const { proxyInput, proxySite } = this.state;
    setLoading(true, 'Testing Proxies', true);
    const splitProxies = proxyInput.split('\n').filter(proxy => proxy !== '');
    const splitProxiesPromises = splitProxies.map(proxy =>
      testProxy(proxy, proxySite)
    );
    const resolvedPromises = await Promise.all(splitProxiesPromises);
    this.setState({
      proxies: resolvedPromises
    });
    setLoading(false, 'Testing Proxies', false);
  };

  render() {
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
        Header: 'Ping(ms)',
        accessor: 'ping'
      }
    ];

    const { proxies, proxySite, maxPing, proxyInput } = this.state;
    return (
      <Row className="h-100">
        <Col className="h-100">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: proxies,
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
            <Row>
              <Col>
                <Container fluid>
                  <Row>
                    <Col xs="6" className="py-3">
                      <Label>
                        Proxies*{' '}
                        <Tooltip
                          arrow
                          distance={20}
                          title="The proxies you want to test."
                        >
                          <FontAwesomeIcon icon="question-circle" />
                        </Tooltip>
                      </Label>
                      <Input
                        rows="4"
                        type="textarea"
                        placeholder="ip:port or ip:port:user:pass"
                        value={proxyInput}
                        name="proxyInput"
                        onChange={this.handleChange}
                      />
                    </Col>
                    <Col xs="3" className="py-3">
                      <Label>
                        Website*{' '}
                        <Tooltip
                          arrow
                          distance={20}
                          title="The website you want to test your proxies on. If you get a ping of -1 then the proxy is unable to connect to the site and may be blocked."
                        >
                          <FontAwesomeIcon icon="question-circle" />
                        </Tooltip>
                      </Label>
                      <Input
                        type="text"
                        value={proxySite}
                        name="proxySite"
                        onChange={this.handleChange}
                      />
                      <Button className="my-2" onClick={this.testProxies}>
                        Test Proxies
                      </Button>
                      <Button
                        className="my-2"
                        onClick={this.copyWorkingProxies}
                      >
                        Copy Proxies
                      </Button>
                    </Col>
                    <Col xs="3" className="py-3">
                      <Label>
                        Max Ping{' '}
                        <Tooltip
                          arrow
                          distance={20}
                          title="The maximum ping of the proxies you wish to copy to your clipboard. Proxies with pings lower than this will be copied then you click 'Copy Proxies'"
                        >
                          <FontAwesomeIcon icon="question-circle" />
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        value={maxPing}
                        name="maxPing"
                        onChange={this.handleChange}
                      />
                      <Button
                        color="danger"
                        className="my-2"
                        onClick={this.clearProxies}
                      >
                        Clear Proxies
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

ProxyTester.propTypes = {
  setLoading: PropTypes.func.isRequired,
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired
};

export default withToastManager(ProxyTester);
