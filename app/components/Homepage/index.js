import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Container, Row, Col, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { getFirestore } from '../../utils/firebase';
import icon from '../../images/animatedIcon.svg';
import { CHECK_FOR_UPDATES, START_UPDATE } from '../../constants/ipcConstants';

const parse = require('html-react-parser');

export default class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      raffles: []
    };
  }

  componentDidMount() {
    this.loadRaffleInfo();
  }

  checkForUpdate = () => {
    const { setLoading } = this.props;
    setLoading(true, 'Checking For Updates', true);
    ipcRenderer.send(CHECK_FOR_UPDATES);
  };

  loadRaffleInfo = async () => {
    const firestore = getFirestore();
    const firebaseRaffles = await firestore
      .collection('raffles')
      .where('endDate', '>=', new Date())
      .get();
    this.setState({
      raffles: firebaseRaffles.docs.map(raffle => raffle.data())
    });
  };

  launchRaffle = raffle => {
    const { setRaffleInfo, history } = this.props;
    setRaffleInfo(raffle);
    history.push('/home/raffle-bot');
  };

  returnRaffleRow = (raffle, index) => (
    <Row
      className="my-3 raffleRow text-left c_pointer"
      key={`Raffle Row ${index}`}
      onClick={() => {
        this.launchRaffle(raffle);
      }}
    >
      <Col xs="3" className="p-0">
        <img
          alt={`${raffle.name}`}
          className="w-100"
          draggable="false"
          src={raffle.img}
        />
      </Col>
      <Col xs="6">
        {raffle.name}
        <br />
        {`Ends ${raffle.endDate.toDate().toLocaleDateString()}`}
      </Col>
      <Col xs="3" className="keep-all">
        {raffle.store}
      </Col>
    </Row>
  );

  returnUpdateStatus = () => {
    const { settings } = this.props;
    if (settings.update.status === 'N') {
      return `No updates as of ${new Date(
        settings.update.lastChecked
      ).toUTCString()}`;
    }
    if (settings.update.status === 'Y') {
      return (
        <span>
          <p>Neutrino version {settings.update.version} is now available</p>
          <p className="updateChangelog">{parse(settings.update.changelog)}</p>
          <small>
            The update will download in the background and then be installed.
          </small>
        </span>
      );
    }
  };

  returnUpdateButton = () => {
    const { settings } = this.props;
    if (settings.update.status === 'N') {
      return <Button onClick={this.checkForUpdate}>Check For Updates</Button>;
    }
    if (settings.update.status === 'Y') {
      return (
        <Button onClick={this.triggerDownload}>
          Download and install update
        </Button>
      );
    }
  };

  triggerDownload = () => {
    const { setDowloading } = this.props;
    ipcRenderer.send(START_UPDATE);
    setDowloading(true);
  };

  render() {
    const { raffles } = this.state;
    const { home } = this.props;
    return (
      <Row className="h-100">
        <Col className="h-100 panel-left h-100">
          <Container fluid className="h-100 p-0">
            <Row className="h-100">
              <Col>
                <p className="text-center">
                  <img
                    alt="Neutrino Non-Text Logo"
                    src={icon}
                    draggable="false"
                    className="my-5"
                    style={{ width: '100px' }}
                  />
                </p>
                <h5 className="font-weight-bold fs-0_8rem">
                  Welcome To Neutrino
                </h5>
                <p>
                  Welcome to Neutrino, we’re constanty adding new features,
                  updates and bug fixes, so makesure you’re always checking the
                  discord for updates.
                </p>
                <h5 className="font-weight-bold fs-0_8rem">Bugs?</h5>
                <p>
                  If you’ve found a bug, makesure open up our discord and post
                  the details of the bug in the #feedback channel.{' '}
                </p>
                <h5 className="font-weight-bold fs-0_8rem">Requests?</h5>
                <p>
                  If you’ve got a request for a feature or an improvement to a
                  current feature, makesure to post it in our #requests channel.
                </p>
                <h5 className="font-weight-bold fs-0_8rem">Help?</h5>
                <p>
                  Need help? Then open up a ticket and our support team will get
                  back to you as soon as possible. Try to include as much
                  information as you can including screenshots, to help to solve
                  the problem quickly.
                </p>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100 p-0">
          <Container fluid className="h-100">
            <Row className="h-50 panel-middle">
              <Container className="h-100 d-flex flex-column">
                <Row>
                  <Col className="py-3">
                    <span className="panel-title">Updates</span>
                  </Col>
                </Row>
                <Row className="flex-fill align-items-center">
                  <Col>{this.returnUpdateStatus()}</Col>
                </Row>
                <Row>
                  <Col className="mb-3">{this.returnUpdateButton()}</Col>
                </Row>
              </Container>
            </Row>
            <Row className="h-50">
              <Col className="p-0 py-3 h-100">
                <Container className="h-100 d-flex flex-column">
                  <Row>
                    <Col>
                      <span className="panel-title">Stats</span>
                    </Col>
                  </Row>
                  <Row className="flex-fill">
                    <Col>
                      <Container fluid className="d-flex flex-column h-100 p-3">
                        <Row className="flex-fill align-items-center">
                          <Col xs="9" className="font-weight-bold">
                            Raffles Entered
                          </Col>
                          <Col xs="3">{home.rafflesEntered}</Col>
                        </Row>
                        <Row className="flex-fill align-items-center">
                          <Col xs="9" className="font-weight-bold">
                            Proxies Created
                          </Col>
                          <Col xs="3">{home.proxiesCreates}</Col>
                        </Row>
                        <Row className="flex-fill align-items-center">
                          <Col xs="9" className="font-weight-bold">
                            Accounts Created
                          </Col>
                          <Col xs="3">{home.accountsCreated}</Col>
                        </Row>
                      </Container>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100 panel-right">
          <Container fluid className="h-100">
            <Row className="h-100">
              <Col className="py-3 px-0">
                <span className="panel-title">Raffles</span>
                <Container fluid>
                  {raffles.length > 0 ? (
                    raffles.map(this.returnRaffleRow)
                  ) : (
                    <Row>
                      <Col className="text-center p-5">
                        <h5>No raffles currently running</h5>
                      </Col>
                    </Row>
                  )}
                </Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

Homepage.propTypes = {
  settings: PropTypes.shape({
    update: PropTypes.shape({
      status: PropTypes.string.isRequired,
      lastChecked: PropTypes.number.isRequired,
      changelog: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired
    })
  }).isRequired,
  setRaffleInfo: PropTypes.func.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  setLoading: PropTypes.func.isRequired,
  home: PropTypes.shape({
    rafflesEntered: PropTypes.number.isRequired,
    proxiesCreates: PropTypes.number.isRequired,
    accountsCreated: PropTypes.number.isRequired
  }).isRequired,
  setDowloading: PropTypes.func.isRequired
};
