import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Progress, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
import url from 'url';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const { BrowserWindow } = require('electron').remote;
const path = require('path');
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const isWin = process.platform === 'win32';

export default class ActivityGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      errorModal: false,
      status: 'Not Started',
      activityEmail: '',
      activityPassword: '',
      activityProxy: '',
      youtube: 0,
      searches: 0,
      shopping: 0,
      news: 0
    };
  }

  componentDidMount = () => {
    console.log(process);
    // windowManager.closeAll();
    // this.setAllAcitivities('Not Started');
  };

  returnActivitiesRow = (activity, index) => {
    const total = activity.youtube + activity.searches + activity.shopping + activity.news;
    return (
      <tr key={`Activity-${index}`} className="activityRow">
        <td>{index + 1}</td>
        <td>{activity.status}</td>
        <td>{activity.activityEmail}</td>
        <td>{activity.activityProxy}</td>
        <td>
          <Progress className="progressBar" value={activity.youtube} max={total}>
            {/* {`${((activity.youtube * 100) / total).toFixed(1)}%`} */}
          </Progress>
        </td>
        <td>
          <Progress className="progressBar" value={activity.searches} max={total} />
        </td>
        <td>
          <Progress className="progressBar" value={activity.shopping} max={total} />
        </td>
        <td>
          <Progress className="progressBar" value={activity.news} max={total} />
        </td>
        <td>
          <FontAwesome
            onClick={() => {
              this.loginToGoogleWindow(activity, index);
              // this.checkGoogleEmail('test@gmail.com');
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

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  setAllAcitivities = status => {
    this.props.activities.forEach((activity, index) => {
      if (activity.status !== status) {
        activity.status = status;
        this.props.onUpdateActivity(index, activity);
      }
    });
  };

  loginToGoogleWindow = async (activity, index) => {
    try {
      this.props.activities[index].status = 'Logging In';
      this.props.onUpdateActivity(index, this.props.activities[index]);
      const tokenID = uuidv4();
      let win = new BrowserWindow({
        width: 500,
        height: 650,
        show: true,
        frame: true,
        resizable: true,
        focusable: true,
        minimizable: true,
        closable: true,
        webPreferences: {
          webviewTag: true,
          allowRunningInsecureContent: true,
          nodeIntegration: true,
          webSecurity: false,
          session: remote.session.fromPartition(`activity-${tokenID}`)
        }
      });
      win.webContents.once('close', () => {
        this.props.activities[index].status = 'Not Started';
        this.props.onUpdateActivity(index, this.props.activities[index]);
      });
      if (activity.activityProxy !== '') {
        await new Promise((resolve, reject) => {
          const proxyArray = activity.activityProxy.split(/@|:/);
          if (proxyArray.length === 4) {
            win.webContents.on('login', (event, request, authInfo, callback) => {
              event.preventDefault();
              callback(proxyArray[0], proxyArray[1]);
            });
          }
          const proxyIpAndPort = proxyArray.slice(-2);
          win.webContents.session.setProxy({ proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` }, () => {
            resolve();
          });
        });
      }
      win.loadURL('https://google.com');
      win.webContents.once('did-finish-load', () => {
        win.webContents.executeJavaScript(`document.querySelector('a[target="_top"]').click();`);
        win.webContents.once('did-finish-load', () => {
          win.webContents.executeJavaScript(`
        document.getElementById("Email").value = "${activity.activityEmail}";
        document.getElementById("next").click();
        `);
          win.webContents.once('did-navigate-in-page', () => {
            win.webContents.executeJavaScript(`
          var passwdObserver = new MutationObserver(function(mutations, me) {
            var canvas = document.getElementById("Passwd");
            if (canvas) {
              canvas.value = "${activity.activityPassword}";
              document.getElementById("signIn").click();
              me.disconnect();
              return;
            }
          });
          passwdObserver.observe(document, {
              childList: true,
              attributes:true,
              subtree: true,
              characterData: true
          })
          `);
            win.webContents.on('did-finish-load', () => {
              win.webContents.executeJavaScript(`window.location`, false, result => {
                if (result.pathname === '/') {
                  win.webContents.removeAllListeners('close', (event, input) => {});
                  win.webContents.session.cookies.get({}, (error, cookies) => {
                    if (error) {
                    } else {
                      win.close();
                      this.startWindow(activity, index, cookies, tokenID);
                    }
                  });
                } else {
                  // win.close();
                  this.props.activities[index].status = 'Stuck In Login';
                  this.props.onUpdateActivity(index, this.props.activities[index]);
                }
              });
            });
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  startWindow = async (activity, index, cookies, tokenID) => {
    try {
      const activityLocation = url.format({
        pathname: process.mainModule.filename,
        protocol: 'file:',
        slashes: true,
        hash: 'activity'
      });
      this.props.activities[index].status = 'Logged In';
      this.props.onUpdateActivity(index, this.props.activities[index]);
      this.props.setActivityWindow(
        index,
        windowManager.createNew(
          `activity-${tokenID}`,
          `activity-${tokenID}`,
          activityLocation,
          false,
          {
            width: this.props.settings.showAcitivtyWindows || isWin ? 500 : 0,
            height: this.props.settings.showAcitivtyWindows || isWin ? 650 : 0,
            show: true,
            frame: false,
            resizable: true,
            focusable: true,
            minimizable: true,
            closable: true,
            allowRunningInsecureContent: true,
            webPreferences: {
              webviewTag: true,
              allowRunningInsecureContent: true,
              nodeIntegration: true,
              webSecurity: false,
              session: remote.session.fromPartition(`activity-${tokenID}`),
              preload:
                process.env.NODE_ENV === 'development'
                  ? path.resolve(__dirname, '..', '..', 'webpack-pack', 'activityPreload.js')
                  : path.resolve(process.resourcesPath, 'webpack-pack', 'activityPreload.js')
            }
          },
          false
        )
      );
      windowManager.sharedData.set(`activity-${tokenID}`, {
        activityDelayMin: this.props.settings.activityDelayMin,
        activityDelayMax: this.props.settings.activityDelayMax,
        settings: this.props.settings,
        data: this.props.activities[index],
        index,
        update: this.props.onUpdateActivity,
        url: 'google.com',
        cookies
      });
      this.props.activityWindows[index].create();
      if (this.props.settings.showAcitivtyWindows || isWin) {
        windowManager.get(`activity-${tokenID}`).object.show();
      }
    } catch (error) {
      this.props.activities[index].status = error.message;
      this.props.onUpdateActivity(index, this.props.activities[index]);
    }
  };

  stopWindow = index => {
    this.props.activities[index].status = 'Not Started';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    if (this.props.activityWindows[index] !== null && !this.props.activityWindows[index].object.isDestroyed()) {
      this.props.activityWindows[index].close();
    }
  };

  deleteWindow = (index, activity) => {
    this.props.onRemoveActivity(activity);
    if (this.props.activityWindows[index]) {
      this.props.activityWindows[index].close();
    }
  };

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
      activityEmail: '',
      activityPassword: '',
      activityProxy: ''
    });
    // this.setState({
    //   status: 'Not Started',
    //   activityEmail: '',
    //   activityPassword: '',
    //   activityProxy: '',
    //   youtube: 0,
    //   searches: 0,
    //   shopping: 0,
    //   news: 0,
    //   total: 0
    // });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  toggleErrorModal = () => {
    this.setState({
      errorModal: !this.state.errorModal
    });
  };

  startAll = () => {
    this.props.activities.forEach((activity, index) => {
      this.loginToGoogleWindow(activity, index);
    });
  };

  stopAll = () => {
    this.props.activities.forEach((activity, index) => {
      this.stopWindow(index);
    });
  };

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
                      <th>proxy</th>
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
                <Input name="activityEmail" onChange={this.handleChange} type="email" value={this.state.activityEmail} />
              </Col>
              <Col xs="2">
                <Label>pass</Label>
                <Input name="activityPassword" onChange={this.handleChange} type="password" value={this.state.activityPassword} />
              </Col>
              <Col xs="2">
                <Label>proxy</Label>
                <Input
                  name="activityProxy"
                  onChange={this.handleChange}
                  value={this.state.activityProxy}
                  placeholder="user:pass@ip:port or ip:port"
                  type="text"
                />
              </Col>
              <Col xs="2" className="d-flex flex-column justify-content-end">
                <Button onClick={this.addActivity}>Add</Button>
              </Col>
              <Col xs="2" className="d-flex flex-column justify-content-end">
                <Button onClick={this.startAll}>Start All</Button>
              </Col>
              <Col xs="2" className="d-flex flex-column justify-content-end">
                <Button onClick={this.stopAll}>Stop All</Button>
              </Col>
              {/* Maybe Add Max Youtube Watch Time .etc */}
            </Row>
          </Container>
          <Modal isOpen={this.state.errorModal} toggle={this.toggleErrorModal} centered>
            <ModalHeader>Errors</ModalHeader>
            <ModalBody>
              <Table>
                <thead>
                  <tr>
                    <td>email</td>
                    <td>error</td>
                  </tr>
                </thead>
                <tbody>
                  {this.state.errors.map((error, index) => {
                    return (
                      <tr key={`error-${index}`}>
                        <td>{error.email}</td>
                        <td>{error.message}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </ModalBody>
          </Modal>
        </Col>
      </CSSTransition>
    );
  }
}
