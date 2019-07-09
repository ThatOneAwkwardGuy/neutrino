import React, { Component } from 'react';
import { Container, Row, Col, Label, Input, Button } from 'reactstrap';
import awsLogo from '../../images/aws.svg';
import digitaloceanLogo from '../../images/digitalocean.svg';
import vultrLogo from '../../images/vultr.svg';
import googlecloudLogo from '../../images/googlecloud.svg';

export default class ProxyCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: ''
    };
  }

  setProvider = e => {
    this.setState({
      provider: e.target.textContent.toLowerCase()
    });
  };

  render() {
    const { provider } = this.state;
    return (
      <Row className="h-100 p-0">
        <Col className="panel-left" xs="1">
          <Container fluid className="px-0 text-center noselect">
            <Row className="px-0">
              <Col
                name="google"
                className={`proxyIcon ${
                  provider === 'google' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    draggable="false"
                    src={googlecloudLogo}
                    className="my-3"
                    alt="Google Cloud Logo"
                  />
                  <h5>Google</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                className={`proxyIcon ${
                  provider === 'aws' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={awsLogo}
                    className="my-3"
                    draggable="false"
                    alt="AWS Logo"
                  />
                  <h5>AWS</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                className={`proxyIcon ${
                  provider === 'digitalocean' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={digitaloceanLogo}
                    className="my-3"
                    draggable="false"
                    alt="DigitalOcean Logo"
                  />
                  <h5>DigitalOcean</h5>
                </span>
              </Col>
            </Row>
            <Row className="px-0">
              <Col
                className={`proxyIcon ${
                  provider === 'vultr' ? 'proxyIconActive' : ''
                }`}
                onClick={this.setProvider}
              >
                <span>
                  <img
                    src={vultrLogo}
                    className="my-3"
                    draggable="false"
                    alt="Vultr Logo"
                  />
                  <h5>Vultr</h5>
                </span>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col xs="11">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-fill">
              <Col>Test</Col>
            </Row>
            <Row className="panel-middle pt-3 align-items-end noselect">
              <Col>
                <Label>Account*</Label>
                <Input type="select" />
              </Col>
              <Col>
                <Label>Proxy Name*</Label>
                <Input type="text" />
              </Col>
              <Col>
                <Label>Region*</Label>
                <Input type="select" />
              </Col>
              <Col>
                <Label>Machine*</Label>
                <Input type="select" />
              </Col>
              <Col>
                <Label>Quantity*</Label>
                <Input type="number" />
              </Col>
            </Row>
            <Row className="py-3 align-items-end">
              <Col>
                <Label>Username*</Label>
                <Input type="select" />
              </Col>
              <Col>
                <Label>Password*</Label>
                <Input type="text" />
              </Col>
              <Col>
                <Button className="d-block">Create</Button>
              </Col>
              <Col>
                <Button className="d-block">Copy</Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}
