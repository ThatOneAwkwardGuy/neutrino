import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

export default class OneClickTester extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Row>
        <Col>One Click Tester</Col>
      </Row>
    );
  }
}
