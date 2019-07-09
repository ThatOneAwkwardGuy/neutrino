import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Row>
        <Col>Settings</Col>
      </Row>
    );
  }
}
