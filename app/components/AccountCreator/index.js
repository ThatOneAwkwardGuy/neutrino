import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

export default class AccountCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Row>
        <Col>Account Creator</Col>
      </Row>
    );
  }
}
