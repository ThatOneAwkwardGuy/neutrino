import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { getFirestore } from '../../utils/firebase';
import icon from '../../images/logo.svg';

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

  returnRaffleRow = (raffle, index) => (
    <Row className="my-3 raffleRow text-left" key={`Raffle Row ${index}`}>
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
      <Col xs="3">{raffle.store}</Col>
    </Row>
  );

  render() {
    const { raffles } = this.state;
    return (
      <Row className="h-100">
        <Col className="h-100 panel-left">
          <Container fluid className="h-100">
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
                  back to you as soon as possible.
                </p>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100 p-0">
          <Container fluid className="h-100">
            <Row className="h-50">
              <Col className="py-3">
                <span className="panel-title">Updates</span>
              </Col>
            </Row>
            <Row className="h-50 panel-middle">
              <Col className="py-3 h-100">
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
                          <Col xs="3">0</Col>
                        </Row>
                        <Row className="flex-fill align-items-center">
                          <Col xs="9" className="font-weight-bold">
                            Proxies Created
                          </Col>
                          <Col xs="3">0</Col>
                        </Row>
                        <Row className="flex-fill align-items-center">
                          <Col xs="9" className="font-weight-bold">
                            Accounts Created
                          </Col>
                          <Col xs="3">0</Col>
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
                <Container fluid>{raffles.map(this.returnRaffleRow)}</Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}
