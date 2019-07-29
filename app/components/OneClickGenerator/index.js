import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  Container,
  Row,
  Col,
  Button,
  Label,
  Input,
  Progress
} from 'reactstrap';
import PropTypes from 'prop-types';

import { createActivityWindow, runAcitivitiesOnWindow } from './functions';

import Table from '../Table';

export default class OneClickGenerator extends Component {
  constructor(props) {
    super(props);
    this.windows = {};
    this.state = {
      accountInput: ''
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  addAllAccounts = () => {
    const { accountInput } = this.state;
    const { addActivities } = this.props;
    const googleAccounts = accountInput
      .split('\n')
      .map(account => {
        const splitAccount = account.split(':');
        if (splitAccount.length === 2) {
          const [email, pass] = splitAccount;
          return {
            email,
            pass,
            proxy: '',
            googleSearch: 0,
            googleNews: 0,
            googleShopping: 0,
            youtube: 0,
            total: 0,
            status: 'Not Started'
          };
        }
        if (splitAccount.length === 4) {
          const [email, pass, ip, port] = splitAccount;
          return {
            email,
            pass,
            proxy: `${ip}:${port}`,
            googleSearch: 0,
            googleNews: 0,
            googleShopping: 0,
            youtube: 0,
            total: 0,
            status: 'Not Started'
          };
        }
        if (splitAccount.length === 6) {
          const [email, pass, ip, port, proxyUser, proxyPass] = splitAccount;
          return {
            email,
            pass,
            proxy: `${proxyUser}:${proxyPass}@${ip}:${port}`,
            googleSearch: 0,
            googleNews: 0,
            googleShopping: 0,
            youtube: 0,
            total: 0,
            status: 'Not Started'
          };
        }
        return undefined;
      })
      .filter(account => account !== undefined);
    addActivities(googleAccounts);
  };

  clearAllAccounts = () => {
    const { deleteAllActivities } = this.props;
    deleteAllActivities();
  };

  runActivity = async (
    index,
    activity,
    settings,
    updateActivity,
    incrementActivity,
    showAcitivtyWindows
  ) => {
    this.windows[index] = await createActivityWindow(
      index,
      activity,
      settings,
      updateActivity,
      showAcitivtyWindows
    );
    runAcitivitiesOnWindow(
      this.windows[index],
      index,
      settings,
      updateActivity,
      incrementActivity
    );
  };

  stopActivity = index => {
    const { updateActivity } = this.props;
    if (this.windows[index] && !this.windows[index].isDestroyed()) {
      this.windows[index].close();
    }
    updateActivity(index, { status: 'Not Started' });
  };

  startAllActivities = () => {
    const {
      activities,
      settings,
      updateActivity,
      incrementActivity,
      showAcitivtyWindows
    } = this.props;
    activities.activities.forEach((activity, index) => {
      this.runActivity(
        index,
        activity,
        settings,
        updateActivity,
        incrementActivity,
        showAcitivtyWindows
      );
    });
  };

  stopAllActivities = () => {
    Object.values(this.windows).forEach((window, index) => {
      this.stopActivity(index);
    });
  };

  deleteActivity = index => {
    const { deleteActivity } = this.props;
    this.stopActivity(index);
    deleteActivity(index);
  };

  render() {
    const { accountInput } = this.state;
    const {
      settings,
      activities,
      updateActivity,
      incrementActivity
    } = this.props;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Proxy',
        accessor: 'proxy'
      }
    ];
    if (settings.activityGoogleSearch) {
      columns.push({
        Header: 'Google Search',
        Cell: row => (
          <Progress
            value={parseInt(
              (row.row.original.googleSearch / row.row.original.total) * 100,
              10
            )}
          />
        )
      });
    }
    if (settings.activityGoogleNews) {
      columns.push({
        Header: 'Google News',
        Cell: row => (
          <Progress
            value={parseInt(
              (row.row.original.googleNews / row.row.original.total) * 100,
              10
            )}
          />
        )
      });
    }
    if (settings.activityGoogleShopping) {
      columns.push({
        Header: 'Google Shopping',
        Cell: row => (
          <Progress
            value={parseInt(
              (row.row.original.googleShopping / row.row.original.total) * 100,
              10
            )}
          />
        )
      });
    }
    if (settings.activityYoutube) {
      columns.push({
        Header: 'Youtube',
        Cell: row => (
          <Progress
            value={parseInt(
              (row.row.original.youtube / row.row.original.total) * 100,
              10
            )}
          />
        )
      });
    }
    columns.push({
      Header: 'Actions',
      Cell: row => (
        <div>
          <FontAwesomeIcon
            className="mx-3"
            icon="play"
            onClick={() => {
              this.runActivity(
                row.row.index,
                row.row.original,
                settings,
                updateActivity,
                incrementActivity
              );
            }}
          />
          <FontAwesomeIcon
            className="mx-3"
            icon="stop"
            onClick={() => {
              this.stopActivity(row.row.index);
            }}
          />
          <FontAwesomeIcon
            className="mx-3"
            icon="trash"
            onClick={() => {
              this.deleteActivity(row.row.index);
            }}
          />
        </div>
      )
    });
    return (
      <Row className="h-100">
        <Col className="h-100">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: activities.activities,
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
                  <Row className="align-items-end">
                    <Col xs="6" className="py-3">
                      <Label>Accounts*</Label>
                      <Input
                        rows="5"
                        type="textarea"
                        placeholder="example@gmail.com:password or example@gmail.com:password:ip:port or example@gmail.com:password:ip:port:user:pass"
                        value={accountInput}
                        name="accountInput"
                        onChange={this.handleChange}
                      />
                    </Col>
                    <Col className="py-3">
                      <Button onClick={this.addAllAccounts}>Add All</Button>
                      <Button
                        onClick={this.clearAllAccounts}
                        className="mt-3"
                        color="danger"
                      >
                        Clear All
                      </Button>
                    </Col>
                    <Col className="py-3">
                      <Button onClick={this.startAllActivities}>
                        Start All
                      </Button>
                      <Button
                        onClick={this.stopAllActivities}
                        className="mt-3"
                        color="danger"
                      >
                        Stop All
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

OneClickGenerator.propTypes = {
  addActivities: PropTypes.func.isRequired,
  deleteActivity: PropTypes.func.isRequired,
  deleteAllActivities: PropTypes.func.isRequired,
  updateActivity: PropTypes.func.isRequired,
  incrementActivity: PropTypes.func.isRequired,
  showAcitivtyWindows: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    activityGoogleSearch: PropTypes.bool.isRequired,
    activityGoogleNews: PropTypes.bool.isRequired,
    activityGoogleShopping: PropTypes.bool.isRequired,
    activityYoutube: PropTypes.bool.isRequired
  }).isRequired,
  activities: PropTypes.shape({
    activities: PropTypes.arrayOf(PropTypes.object).isRequired
  }).isRequired
};
