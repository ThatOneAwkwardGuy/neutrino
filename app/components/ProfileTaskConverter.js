import React, { Component } from 'react';
import { Container, Row, Col, Input, Label } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import Dropzone from 'react-dropzone';
var fs = require('fs');

const profileTaskConversionOptions = ['CyberSole', 'ProjectDestroyer', 'EveAIO', 'TheKickStation'];

export default class ProfileTaskConverter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableBoxes: {
        profiles: [],
        tasks: []
      },
      accepted: [],
      bot: 'CyberSole',
      mode: 'profiles',
      errorNotification: false
    };
  }

  handleChangeFromToOption = (index, e) => {
    let item = { ...this.state.draggableBoxes[this.state.mode][index] };
    item[e.target.name] = e.target.value;
    let items = [...this.state.draggableBoxes[this.state.mode]];
    items[index] = item;
    this.setState({ draggableBoxes: { ...this.state.draggableBoxes, [this.state.mode]: items } });
  };

  returnOptions = (optionsArray, name) => {
    return optionsArray.map((elem, index) => <option key={`option-${name}-${index}`}>{elem}</option>);
  };

  getList = id => {
    const idArray = id.split('-');
    return this.state.draggableBoxes[idArray[0]][idArray[1]];
  };

  onDragEnd = result => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId) {
      const items = this.reorder(this.getList(source.droppableId), source.index, destination.index);
      let draggableBoxesNew = { ...this.state.draggableBoxes };
      const idArray = source.droppableId.split('-');
      draggableBoxesNew[idArray[0]][idArray[1]].items = items;
      this.setState({ draggableBoxes: draggableBoxesNew });
    } else {
      const result = this.move(this.getList(source.droppableId), this.getList(destination.droppableId), source, destination);
      let draggableBoxesNew = { ...this.state.draggableBoxes };
      for (const items in result) {
        const idArray = items.split('-');
        draggableBoxesNew[idArray[0]][idArray[1]].items = result[items];
      }
      this.setState({ draggableBoxes: draggableBoxesNew });

      // this.setState({
      //   items: result.droppable,
      //   selected: result.droppable2
      // });
    }
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list.items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source.items);
    const destClone = Array.from(destination.items);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);
    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
  };

  removeDraggableBox = (name, index) => {
    const draggableBoxesNew = { ...this.state.draggableBoxes };
    draggableBoxesNew[name].splice(index, 1);
    this.setState({ draggableBoxes: draggableBoxesNew });
  };

  returnDraggableBoxes = () => {
    const tree = [];
    for (let i = 0; i < this.state.draggableBoxes[this.state.mode].length; i++) {
      const indexNumber = i;
      tree.push(
        <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
          <Col xs="4" style={{ display: 'inline-block' }} className="draggableBoxContainer" key={`draggableBox-${i}`}>
            <Container fluid style={{ padding: '0px' }} className="d-flex flex-column">
              <Row className="flex-grow-1">
                <Droppable droppableId={`profiles-${indexNumber}`}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} className="col-12">
                      {this.returnDraggableListUsingArray(
                        this.state.draggableBoxes[this.state.mode][indexNumber],
                        'profileList',
                        indexNumber,
                        provided,
                        snapshot
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Row>
              <Row className="draggableBoxSelectInput">
                <Col xs="1" className="d-flex align-items-center justify-content-center draggableBoxBin">
                  <FontAwesome
                    name="trash"
                    onClick={() => {
                      this.removeDraggableBox(this.state.mode, indexNumber);
                    }}
                  />
                </Col>
                <Col xs="4" className="ml-auto" style={{ padding: '0px' }}>
                  <Input
                    type="select"
                    name="from"
                    id="from"
                    value={this.state.draggableBoxes[this.state.mode][indexNumber].from}
                    onChange={e => {
                      this.handleChangeFromToOption(indexNumber, e);
                    }}
                  >
                    {this.returnOptions(profileTaskConversionOptions, 'from')}
                  </Input>
                </Col>
                <Col xs="1" className="text-center d-flex align-items-center justify-content-center">
                  <FontAwesome name="arrow-right" />
                </Col>
                <Col xs="4" style={{ padding: '0px' }}>
                  <Input
                    type="select"
                    value={this.state.draggableBoxes[this.state.mode][indexNumber].to}
                    name="to"
                    id="to"
                    onChange={e => {
                      this.handleChangeFromToOption(indexNumber, e);
                    }}
                  >
                    {this.returnOptions(profileTaskConversionOptions, 'to')}
                  </Input>
                </Col>
                <Col xs="1" className="d-flex align-items-center justify-content-center draggableBoxBin ml-auto">
                  <FontAwesome name="save" onClick={this.addDraggableBox} />
                </Col>
              </Row>
            </Container>
          </Col>
        </CSSTransition>
      );
    }
    return tree;
  };

  addDraggableBox = () => {
    this.setState({
      draggableBoxes: {
        ...this.state.draggableBoxes,
        [this.state.mode]: [
          ...this.state.draggableBoxes[this.state.mode],
          {
            from: '',
            to: '',
            items: []
          }
        ]
      }
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  cybersoleProfileToBase = file => {
    const items = [];
    for (const profile in file) {
      items.push({
        profileID: file[profile].name,
        deliveryCountry: file[profile].delivery.country,
        deliveryAddress: file[profile].delivery.addr1,
        deliveryAddress2: file[profile].delivery.addr2,
        deliveryCity: file[profile].delivery.city,
        deliveryFirstName: file[profile].delivery.first_name,
        deliveryLastName: file[profile].delivery.last_name,
        deliveryProvince: file[profile].delivery.state,
        deliveryZip: file[profile].delivery.zip,
        deliverySameAsDelivery: file[profile].delivery.same_as_del,
        billingSameAsDelivery: file[profile].billing.last_name,
        billingZip: file[profile].billing.zip,
        billingCountry: file[profile].billing.country,
        billingAddress: file[profile].billing.addr1,
        billingAddress2: file[profile].billing.addr2,
        billingCity: file[profile].billing.city,
        billingFirstName: file[profile].billing.first_name,
        billingLastName: file[profile].billing.last_name,
        billingProvince: file[profile].billing.state,
        phoneNumber: file[profile].payment.phone,
        paymentEmail: file[profile].payment.email,
        paymentCardholdersName: file[profile].payment.name,
        paymentCardnumber: file[profile].payment.card.number,
        paymentCardExpiryMonth: file[profile].payment.card.exp_month,
        paymentCardExpiryYear: file[profile].payment.card.exp_year,
        paymentCVV: file[profile].payment.card.cvv,
        deliveryAptorSuite: '',
        billingAptorSuite: ''
      });
    }
    this.appendProfile(items);
  };

  appendProfile = profilesArray => {
    this.setState({
      draggableBoxes: { ...this.state.draggableBoxes, profiles: [...this.state.draggableBoxes.profiles, { items: profilesArray, from: this.state.bot }] }
    });
  };

  returnDraggableListUsingArray = (listArray, name, listIndex, provided, snapshot) => {
    return listArray.items.map((item, index) => (
      <Draggable
        key={`${name}-draggableListItem-${listIndex}-${item.profileID}-${index}`}
        draggableId={`${name}-draggableListItem-${listIndex}-${item.profileID}-${index}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            {item.profileID}
          </div>
        )}
      </Draggable>
    ));
  };

  convertToBase = file => {
    fs.readFile(file[0].path, 'utf-8', (err, data) => {
      if (err) {
        this.setState({
          profileImportFailure: true
        });
        return;
      }
      const profileOBJ = JSON.parse(data);
      switch (this.state.bot) {
        case 'CyberSole':
          this.cybersoleProfileToBase(profileOBJ);
          break;
        default:
          break;
      }
      // for (const profile in profileOBJ) {
      //   this.props.onAddProfile(profileOBJ[profile]);
      // }
    });
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row>
              <div className="col-10">
                <Dropzone
                  accept="application/json"
                  onDrop={accepted => {
                    this.convertToBase(accepted);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div>
                      <div {...getRootProps()} className="dropzone text-center">
                        <input {...getInputProps()} />
                        <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                          <FontAwesome name="plus" onClick={this.addDraggableBox} />
                        </div>
                      </div>
                    </div>
                  )}
                </Dropzone>
              </div>
              <div className="col-2 text-center d-flex align-items-center justify-content-center">
                <h6>drop profiles/tasks files here</h6>
              </div>
            </Row>
            <Row style={{ overflowX: 'scroll', flexWrap: 'nowrap' }} className="flex-fill">
              <DragDropContext onDragEnd={this.onDragEnd}>{this.returnDraggableBoxes()}</DragDropContext>
            </Row>
            <Row>
              <Col xs="1" className="d-flex align-items-end justify-content-left">
                <FontAwesome name="plus" className="draggableBoxPlus d-flex align-items-center justify-content-center" onClick={this.addDraggableBox} />
              </Col>
              <Col xs="2" className="ml-auto">
                <Label for="mode">bot</Label>
                <Input
                  type="select"
                  name="bot"
                  id="bot"
                  value={this.state.mode}
                  onChange={event => {
                    this.handleChange(event);
                  }}
                >
                  {this.returnOptions(profileTaskConversionOptions, 'fileInputBotType')}
                </Input>
              </Col>
              <Col xs="2">
                <Label for="mode">mode</Label>
                <Input
                  type="select"
                  name="mode"
                  id="mode"
                  value={this.state.mode}
                  onChange={event => {
                    this.handleChange(event);
                  }}
                >
                  <option>profiles</option>
                  <option>tasks</option>
                </Input>
              </Col>
            </Row>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
