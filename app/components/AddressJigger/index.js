import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  CustomInput,
  Button
} from 'reactstrap';
import { withToastManager } from 'react-toast-notifications';
import PropTypes from 'prop-types';
import { jigAddresses } from './functions';

const { clipboard } = require('electron');

class AddressJigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address1: '',
      city: '',
      aptSuite: '',
      region: '',
      country: '',
      zipcode: '',
      quantity: 0,
      jigAddressesBool: true,
      fourCharPrefixBool: false,
      jiggedAddresses: []
    };
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleToggleChange = e => {
    const { name } = e.target;
    this.setState(prevState => ({
      [name]: !prevState[name]
    }));
  };

  jigAddresses = () => {
    const {
      address1,
      city,
      aptSuite,
      region,
      country,
      zipcode,
      fourCharPrefixBool,
      quantity
    } = this.state;
    const finalJiggedAddresses = jigAddresses(
      address1,
      city,
      aptSuite,
      region,
      country,
      zipcode,
      fourCharPrefixBool,
      quantity
    );
    this.setState({
      jiggedAddresses: finalJiggedAddresses
    });
  };

  copyToClipboard = () => {
    const { jiggedAddresses } = this.state;
    const { toastManager } = this.props;
    let string = '';
    jiggedAddresses.forEach(elem => {
      string += `${elem}\n`;
    });
    clipboard.writeText(string, 'selection');
    toastManager.add('Jigged addresses copied to clipboard', {
      appearance: 'success',
      autoDismiss: true,
      pauseOnHover: true
    });
  };

  returnJiggedAddressesRows = jiggedAddress => (
    <Col xs="3" className="addressCard">
      {jiggedAddress}
    </Col>
  );

  render() {
    const {
      address1,
      city,
      aptSuite,
      region,
      country,
      zipcode,
      jigAddressesBool,
      fourCharPrefixBool,
      jiggedAddresses,
      quantity
    } = this.state;
    return (
      <Row className="h-100 p-0">
        <Col xs="4" className="panel-left py-3 overflow-y-scroll h-100">
          <Container fluid>
            <FormGroup row>
              <Col>
                <Label>Address</Label>
                <Input
                  name="address1"
                  value={address1}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="8">
                <Label>City</Label>
                <Input
                  name="city"
                  value={city}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
              <Col xs="4">
                <Label>Apt/Suite</Label>
                <Input
                  name="aptSuite"
                  value={aptSuite}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="12">
                <Label>Region/State</Label>
                <Input
                  name="region"
                  value={region}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="12">
                <Label>Country</Label>
                <Input
                  name="country"
                  value={country}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="8">
                <Label>Post/Zip Code</Label>
                <Input
                  name="zipcode"
                  value={zipcode}
                  onChange={this.handleChange}
                  type="text"
                />
              </Col>
              {fourCharPrefixBool ? (
                <Col xs="4">
                  <Label>Quantity</Label>
                  <Input
                    name="quantity"
                    value={quantity}
                    onChange={this.handleChange}
                    type="number"
                    min="0"
                  />
                </Col>
              ) : null}
            </FormGroup>
            <FormGroup row>
              <Col>
                <Label>Jig Addresses</Label>
                <CustomInput
                  type="switch"
                  id="jigAddressesBool"
                  name="jigAddressesBool"
                  checked={jigAddressesBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
              <Col>
                <Label>4 Char Prefix</Label>
                <CustomInput
                  type="switch"
                  id="fourCharPrefixBool"
                  name="fourCharPrefixBool"
                  checked={fourCharPrefixBool}
                  onChange={this.handleToggleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="12">
                <Button onClick={this.jigAddresses}>Jig</Button>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col xs="12">
                <Button onClick={this.copyToClipboard}>Copy</Button>
              </Col>
            </FormGroup>
          </Container>
        </Col>
        <Col className="h-100 py-3 overflow-y-scroll">
          <Container>
            <Row>{jiggedAddresses.map(this.returnJiggedAddressesRows)}</Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

AddressJigger.propTypes = {
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired
};

export default withToastManager(AddressJigger);
