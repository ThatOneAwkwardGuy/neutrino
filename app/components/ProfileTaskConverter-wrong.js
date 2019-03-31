import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Modal, ModalBody, ModalFooter, Form, FormGroup } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import Dropzone from 'react-dropzone';
const fs = require('fs');
const { dialog } = require('electron').remote;
const csvtojsonV2 = require('csvtojson');
const csvToJson = require('convert-csv-to-json');
const Papa = require('papaparse');
const profileTaskConversionOptions = ['CyberSole', 'ProjectDestroyer', 'EveAIO', 'TheKickStation'];
const profileAttributeMaping = {
  profileID: 'profile name',
  deliveryCountry: 'delivery country',
  deliveryAddress: 'delivery address',
  deliveryAddress2: 'delivery address 2',
  deliveryCity: 'delivery city',
  deliveryFirstName: 'delivery first name',
  deliveryLastName: 'delivery last name',
  deliveryProvince: 'delivery state',
  deliveryZip: 'delivery zip',
  billingZip: 'billing zip',
  billingCountry: 'billing country',
  billingAddress: 'billing address',
  billingAddress2: 'billing address 2',
  billingCity: 'billing city',
  billingFirstName: 'billing first name',
  billingLastName: 'billing last name',
  billingProvince: 'billing state',
  phoneNumber: 'phone no.',
  paymentEmail: 'email',
  paymentCardholdersName: 'cardholders name',
  paymentCardnumber: 'card no.',
  paymentCardExpiryMonth: 'card exp month',
  paymentCardExpiryYear: 'card exp year',
  paymentCVV: 'cvv',
  deliveryAptorSuite: 'delivery apt/suite',
  billingAptorSuite: 'billing apt/suite'
};
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
      errorNotification: false,
      currentObject: {}
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
        <CSSTransition in={true} appear={true} timeout={300} classNames="fade" key={`draggableBox-transition-container-${i}`}>
          <Col xs="4" style={{ display: 'inline-block' }} className="draggableBoxContainer" key={`draggableBox-${i}`}>
            <Container fluid style={{ padding: '0px' }} className="d-flex flex-column">
              <Row className="flex-grow-1">
                <Droppable droppableId={`profiles-${indexNumber}`}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} className="col-12" style={{ padding: '0px' }}>
                      {this.returnDraggableListUsingArray(
                        this.state.draggableBoxes[this.state.mode][indexNumber],
                        `${this.state.mode}-${indexNumber}`,
                        indexNumber,
                        provided,
                        snapshot
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Row>
              <Row className="draggableBoxSelectInput d-flex justify-content-center">
                <Col xs="1" className="d-flex align-items-center justify-content-center draggableBoxBin">
                  <FontAwesome
                    name="trash"
                    onClick={() => {
                      this.removeDraggableBox(this.state.mode, indexNumber);
                    }}
                  />
                </Col>
                <Col xs="10" style={{ padding: '0px' }}>
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
                <Col xs="1" className="d-flex align-items-center justify-content-center draggableBoxBin">
                  <FontAwesome
                    name="save"
                    onClick={() => {
                      this.convertToBot(
                        this.state.draggableBoxes[this.state.mode][indexNumber].to,
                        this.state.draggableBoxes[this.state.mode][indexNumber].items
                      );
                    }}
                  />
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
            to: profileTaskConversionOptions[0],
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

  csvToBase = csvJSON => {
    const items = csvJSON;
    this.appendToItems(items);
  };

  saveToFile = (name, extension, file) => {
    if (extension === 'json') {
      file = JSON.stringify(file);
    }
    dialog.showSaveDialog(
      {
        title: 'name',
        defaultPath: `~/${name}.${extension}`,
        filters: [{ name: `${name} Files`, extensions: [extension] }]
      },
      fileName => {
        if (fileName === undefined) {
          return;
        }
        fs.writeFile(fileName, file, err => {
          if (err) {
            this.setState({
              profileExportFailure: true
            });
            return;
          }
          this.setState({
            profileExportSuccess: true
          });
        });
      }
    );
  };

  appendToItems = profilesArray => {
    this.setState({
      draggableBoxes: {
        ...this.state.draggableBoxes,
        profiles: [...this.state.draggableBoxes.profiles, { items: profilesArray, from: this.state.bot, to: this.state.bot }]
      }
    });
  };

  toggleModal = () => {
    this.setState({
      editModal: !this.state.editModal
    });
  };

  editItem = (name, index) => {
    const idArray = name.split('-');
    const draggableBoxesNew = { ...this.state.draggableBoxes };
    this.setState({ currentObject: draggableBoxesNew[idArray[0]][idArray[1]].items[index], editModal: true, idArray: idArray, index: index });
  };

  deleteItem = (name, index) => {
    const idArray = name.split('-');
    const draggableBoxesNew = { ...this.state.draggableBoxes };
    draggableBoxesNew[idArray[0]][idArray[1]].items.splice(index, 1);
    this.setState({ draggableBoxes: draggableBoxesNew });
  };

  returnDraggableListUsingArray = (listArray, name, listIndex, provided, snapshot) => {
    return listArray.items.map((item, index) => (
      <Draggable
        key={`${name}-draggableListItem-${listIndex}-${item.name}-${index}`}
        draggableId={`${name}-draggableListItem-${listIndex}-${item.name}-${index}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Container fluid>
              <Row style={{ backgroundColor: '#1A36C4' }}>
                <Col xs="8" style={{ padding: '10px' }}>
                  {item.name}
                </Col>
                <Col xs="2" className="text-center">
                  <FontAwesome
                    name="edit"
                    style={{ padding: '10px' }}
                    onClick={() => {
                      this.editItem(name, index);
                    }}
                  />
                </Col>
                <Col xs="2" className="text-center">
                  <FontAwesome
                    name="trash"
                    style={{ padding: '10px' }}
                    onClick={() => {
                      this.deleteItem(name, index);
                    }}
                  />
                </Col>
              </Row>
            </Container>
          </div>
        )}
      </Draggable>
    ));
  };

  convertToBase = async file => {
    const fileExtention = file[0].path.split('.').pop();
    if (fileExtention === 'json') {
      fs.readFile(file[0].path, 'utf-8', (err, data) => {
        if (err) {
          this.setState({
            profileImportFailure: true
          });
          return;
        }
        const profileOBJ = JSON.parse(data);
        const items = [];
        for (const profile in profileOBJ) {
          items.push(profileOBJ[profile]);
        }
        this.appendToItems(items);
      });
    } else if (fileExtention === 'csv') {
      // const csvJSON = await csvtojsonV2().fromFile(file[0].path);
      const json = csvToJson.fieldDelimiter(',').getJsonFromCsv(file[0].path);
      this.csvToBase(json);

      // Papa.parse(new File([''], file[0].path), {
      //   header: true,
      //   delimiter: ',',
      //   complete: (result, file) => {
      //     console.log(result);
      //     console.log(file);
      //     this.csvToBase(result);
      //   }
      // });
    }
  };

  convertToBot = (botName, file) => {
    switch (botName) {
      case 'CyberSole':
        this.baseProfileToCybersole(file);
        break;
      default:
        break;
    }
  };

  handleCurrentObjectChange = e => {
    this.setState({
      currentObject: { ...this.state.currentObject, [e.target.name]: e.target.value }
    });
  };

  convertProfileObjectToFormGroup = profileObject => {
    const tree = [];
    let subTree = [];
    let counter = 0;
    for (const item in profileObject) {
      if (profileAttributeMaping[item] !== undefined) {
        counter++;
        subTree.push(
          <Col xs="4" key={`currentObject-${item}`}>
            <Label>{profileAttributeMaping[item]}</Label>
            <Input
              name={item}
              value={this.state.currentObject[item]}
              onChange={event => {
                this.handleCurrentObjectChange(event);
              }}
            />
          </Col>
        );

        if (counter % 3 === 0 && Object.keys(profileObject).length - counter > 3) {
          tree.push(
            <Row style={{ marginBottom: '20px', marginTop: '20px' }} key={`currentObject-row-${item}`}>
              {subTree}
            </Row>
          );
          subTree = [];
        } else if (Object.keys(profileObject).length - counter < 3) {
          tree.push(
            <Row style={{ marginBottom: '20px', marginTop: '20px' }} key={`currentObject-row-${item}`}>
              {subTree}
            </Row>
          );
        }
      }
    }
    return tree;
  };

  saveCurrentObject = (newObject, idArray, index) => {
    console.log(newObject);
    const draggableBoxesNew = { ...this.state.draggableBoxes };
    draggableBoxesNew[idArray[0]][idArray[1]].items[index] = newObject;
    this.setState({ draggableBoxes: draggableBoxesNew });
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row>
              <div className="col-10">
                <Dropzone
                  accept="application/json, text/csv"
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
          <Modal isOpen={this.state.editModal} toggle={this.toggleModal} centered={true} size="lg">
            <ModalBody>
              <Form>
                <FormGroup className="container-fluid">{this.convertProfileObjectToFormGroup(this.state.currentObject)}</FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  this.saveCurrentObject(this.state.currentObject, this.state.idArray, this.state.index);
                  this.toggleModal();
                }}
              >
                save
              </Button>
              <Button
                onClick={() => {
                  this.toggleModal();
                }}
                className="btn-danger"
              >
                cancel
              </Button>
            </ModalFooter>
          </Modal>
        </Col>
      </CSSTransition>
    );
  }
}
