import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  Button,
  CustomInput
} from 'reactstrap';

export default class ProfileCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Row className="h-100 p-0">
        <Col className="panel-left h-100" xs="6">
          <h5 className="my-3">Main Profile</h5>
          <Container fluid className="px-0 noselect">
            <Row className="px-0">
              <Col>
                <Label>Catchall</Label>
                <Input type="text" placeholder="example.com" />
              </Col>
              <Col>
                <Label>Phone</Label>
                <Input type="text" />
              </Col>
            </Row>
            <Row>
              <Col>
                <h6 className="d-block mt-5 mb-2">Delivery Address</h6>
              </Col>
              <Col>
                <h6 className="d-block mt-5 mb-2">Billing Address</h6>
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col>
                <Label>First Name</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col>
                <Label>Last Name</Label>
                <Input type="text" placeholder="Doe" />
              </Col>
              <Col>
                <Label>First Name</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col>
                <Label>Last Name</Label>
                <Input type="text" placeholder="Doe" />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col>
                <Label>Address</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col>
                <Label>Address</Label>
                <Input type="text" placeholder="John" />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col xs="4">
                <Label>City</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col>
                <Label>Apt</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col xs="4">
                <Label>City</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col>
                <Label>Apt</Label>
                <Input type="text" placeholder="John" />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col>
                <Label>Country</Label>
                <Input type="select" placeholder="John" />
              </Col>
              <Col>
                <Label>Country</Label>
                <Input type="select" placeholder="John" />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col xs="4">
                <Label>Region</Label>
                <Input type="select" placeholder="John" />
              </Col>
              <Col>
                <Label>Zip</Label>
                <Input type="text" placeholder="John" />
              </Col>
              <Col xs="4">
                <Label>Region</Label>
                <Input type="select" placeholder="John" />
              </Col>
              <Col>
                <Label>Zip</Label>
                <Input type="text" placeholder="John" />
              </Col>
            </Row>
            <Row className="my-4">
              <Col xs={{ size: 6, offset: 6 }}>
                <Button>Copy Delivery</Button>
              </Col>
            </Row>
            <Row>
              <Col xs="4" className="my-2">
                <Label>Same Delivery/Billing</Label>
                <CustomInput type="switch" id="randomPass" name="randomPass" />
              </Col>
              <Col xs="4" className="my-2">
                <Label>One Checkout</Label>
                <CustomInput type="switch" id="randomPass" name="randomPass" />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Name</Label>
                <CustomInput type="switch" id="randomPass" name="randomPass" />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Random Phone Number</Label>
                <CustomInput type="switch" id="randomPass" name="randomPass" />
              </Col>
              <Col xs="4" className="my-2">
                <Label>Use Catchall</Label>
                <CustomInput type="switch" id="randomPass" name="randomPass" />
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}
