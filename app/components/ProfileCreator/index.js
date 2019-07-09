import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class ProfileCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Row>
        <Col>Profile Creator</Col>
        <Col>
          <Container fluid>
            <Row>Test</Row>
            <Row>Test</Row>
          </Container>
        </Col>
      </Row>
    );
  }
}
