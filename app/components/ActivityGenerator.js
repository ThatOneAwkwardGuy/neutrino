import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const path = require('path');
import url from 'url';

export default class ActivityGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Not Started',
      activityEmail: '',
      activityPassword: '',
      activityProxy: '',
      email: 0,
      youtube: 0,
      searches: 0,
      shopping: 0,
      news: 0,
      total: 0
    };
  }

  returnActivitiesRow = (activity, index) => {
    return (
      <tr key={`Activity-${index}`}>
        <td>{index + 1}</td>
        <td>{activity.status}</td>
        <td>{activity.activityEmail}</td>
        <td>{activity.email}</td>
        <td>{activity.youtube}</td>
        <td>{activity.searches}</td>
        <td>{activity.shopping}</td>
        <td>{activity.news}</td>
        <td>
          <FontAwesome
            onClick={() => {
              this.startWindow(index);
            }}
            name="play"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            onClick={() => {
              this.stopWindow(index);
            }}
            name="stop"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            name="trash"
            style={{ padding: '10px' }}
            className="taskButton btn"
            onClick={() => {
              this.deleteWindow(index, activity);
            }}
          />
        </td>
      </tr>
    );
  };

  startWindow = index => {
    const activityLocation = url.format({
      pathname: path.resolve(__dirname, '..', 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: 'activity'
    });
    console.log(activityLocation);
    this.props.setActivityWindow(
      index,
      windowManager.open(
        `window-${index}`,
        `window-${index}`,
        activityLocation,
        false,
        {
          menu: null,
          modal: true,
          minWidth: 200,
          minHeight: 300,
          width: 500,
          height: 650,
          frame: true,
          resizable: true,
          focusable: true,
          minimizable: true,
          closable: true,
          allowRunningInsecureContent: true,
          webPreferences: {
            contextIsolation: false,
            allowRunningInsecureContent: true
            // preload: path.resolve(__dirname, '..', 'utils', 'activityPreload.js'),
          }
        },
        true
      )
    );
    windowManager.sharedData.set(`window-${index}`, { data: this.props.activities[index], update: this.props.onUpdateActivity });
  };

  stopWindow = index => {
    this.props.activities[index].status = 'Not Started';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    if (this.props.activityWindows[index]) {
      this.props.activityWindows[index].close();
    }
  };

  deleteWindow = (index, activity) => {
    this.props.onRemoveActivity(activity);
    this.props.activityWindows[index].close();
  };

  componentDidMount() {
    windowManager.closeAll();
  }

  addActivity = () => {
    this.props.onCreateActivity({
      activityEmail: this.state.activityEmail,
      activityPassword: this.state.activityPassword,
      activityProxy: this.state.activityProxy,
      email: this.state.email,
      youtube: this.state.youtube,
      searches: this.state.searches,
      shopping: this.state.shopping,
      news: this.state.news,
      status: this.state.status
    });
    this.setState({
      status: 'Not Started',
      activityEmail: '',
      activityPassword: '',
      activityProxy: '',
      email: 0,
      youtube: 0,
      searches: 0,
      shopping: 0,
      news: 0,
      total: 0
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loginToGoogle = () => {};

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row className="d-flex flex-grow-1" style={{ maxHeight: '100%' }}>
              <Col xs="12" style={{ overflowY: 'scroll', marginBottom: '30px' }}>
                <Table responsive hover className="text-center">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>status</th>
                      <th>account</th>
                      <th>email</th>
                      <th>youtube</th>
                      <th>searches</th>
                      <th>shopping</th>
                      <th>news</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>{this.props.activities.map(this.returnActivitiesRow)}</tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col xs="2">
                <Label>email</Label>
                <Input name="activityEmail" onChange={this.handleChange} type="email" />
              </Col>
              <Col xs="2">
                <Label>pass</Label>
                <Input name="activityPassword" onChange={this.handleChange} type="password" />
              </Col>
              <Col xs="2">
                <Label>proxy</Label>
                <Input name="activityProxy" onChange={this.handleChange} type="text" />
              </Col>
              <Col xs="1" className="d-flex flex-column justify-content-end">
                <Button onClick={this.addActivity}>Add</Button>
              </Col>
              {/* Maybe Add Max Youtube Watch Time .etc */}
            </Row>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
