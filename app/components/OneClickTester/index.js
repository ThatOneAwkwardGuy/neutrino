import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Container, Row, Col, Label, Input, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Table from '../Table/index';
import {
  testPuppeteerAccount,
  testPuppeteerAccountV3
} from '../OneClickGenerator/functions';

export default class OneClickTester extends Component {
  constructor(props) {
    super(props);
    this.windows = [];
    this.state = {
      accounts: [],
      massAccounts: ''
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  addAccounts = () => {
    const { massAccounts } = this.state;
    const massAccountsArray = massAccounts.split('\n');
    const accounts = massAccountsArray
      .map(massAccount => {
        const splitMassAccount = massAccount.split(':');
        console.log(splitMassAccount);
        if (splitMassAccount.length === 2) {
          const [email, pass] = splitMassAccount;
          return { email, pass, proxy: '', status: 'Not Started' };
        }
        if (splitMassAccount.length === 4) {
          const [email, pass, ip, port] = splitMassAccount;
          return {
            email,
            pass,
            proxy: `${ip}:${port}`,
            status: 'Not Started'
          };
        }
        if (splitMassAccount.length === 6) {
          const [email, pass, ip, port, user, proxyPass] = splitMassAccount;
          return {
            email,
            pass,
            proxy: `${user}:${proxyPass}@${ip}:${port}`,
            status: 'Not Started'
          };
        }
        return undefined;
      })
      .filter(account => account !== undefined);
    this.setState(prevState => ({
      accounts: [...prevState.accounts, ...accounts]
    }));
  };

  clearAccounts = () => {
    this.setState({ accounts: [] });
    this.windows = [];
  };

  setAccountStatus = (index, status) => {
    const { accounts } = this.state;
    const googleAccounts = [...accounts];
    if (googleAccounts[index]) {
      googleAccounts[index].status = status;
      this.setState({ accounts: googleAccounts });
    }
  };

  setAccountScore = (index, score) => {
    const { accounts } = this.state;
    const googleAccounts = [...accounts];
    if (googleAccounts[index]) {
      googleAccounts[index].oneClickV3Score = score;
      this.setState({ accounts: googleAccounts });
    }
  };

  testAllAccounts = () => {
    const { accounts } = this.state;
    const { settings } = this.props;
    this.windows = accounts.map((account, index) =>
      this.testAccount(index, account, settings)
    );
  };

  testAccount = (index, account, settings) => {
    testPuppeteerAccount(index, account, settings, this.setAccountStatus, true);
    testPuppeteerAccountV3(
      index,
      account,
      settings,
      this.setAccountScore,
      true
    );
  };

  stopAccount = async row => {
    this.windows[row.row.index] = await Promise.resolve(
      this.windows[row.row.index]
    );
    if (
      this.windows[row.row.index] &&
      !this.windows[row.row.index].isDestroyed()
    ) {
      this.windows[row.row.index].close();
    }
    this.windows = this.windows.filter(
      (window, index) => index !== row.row.index
    );
  };

  deleteAccount = row => {
    const { accounts } = this.state;
    this.stopAccount(row);
    const filteredAccounts = accounts.filter(
      (account, index) => index !== row.row.index
    );
    this.setState({
      accounts: filteredAccounts
    });
  };

  render() {
    const { accounts, massAccounts } = this.state;
    const { settings } = this.props;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Proxy',
        accessor: 'proxy'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'One Click V3 Score',
        accessor: 'oneClickV3Score'
      },
      {
        Header: 'Actions',
        Cell: row => (
          <div>
            <FontAwesomeIcon
              className="mx-3"
              icon="play"
              onClick={() => {
                this.windows.push(
                  this.testAccount(row.row.index, row.row.original, settings)
                );
              }}
            />
            <FontAwesomeIcon
              className="mx-3"
              icon="stop"
              onClick={() => {
                this.stopAccount(row);
              }}
            />
            <FontAwesomeIcon
              className="mx-3"
              icon="trash"
              onClick={() => {
                this.deleteAccount(row);
              }}
            />
          </div>
        )
      }
    ];
    return (
      <Row className="h-100 p-0">
        <Col className="h-100" xs="12">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: accounts,
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
            <Row className="py-3 align-items-end noselect">
              <Col xs="8">
                <Label>Google Accounts*</Label>
                <Input
                  type="textarea"
                  name="massAccounts"
                  placeholder="example@gmail.com:password or example@gmail.com:password:ip:port or example@gmail.com:password:ip:port:user:pass"
                  rows="5"
                  value={massAccounts}
                  onChange={this.handleChange}
                />
              </Col>
              <Col xs="4">
                <Button className="mb-2" onClick={this.addAccounts}>
                  Add
                </Button>
                <Button className="my-2" onClick={this.testAllAccounts}>
                  Test
                </Button>
                <Button
                  color="danger"
                  className="mt-2"
                  onClick={this.clearAccounts}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

OneClickTester.propTypes = {
  settings: PropTypes.objectOf(PropTypes.any).isRequired
};
