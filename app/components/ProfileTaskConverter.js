import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Modal, ModalBody, ModalFooter, Form, FormGroup } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import Dropzone from 'react-dropzone';
const fs = require('fs');
const { dialog } = require('electron').remote;
const csvToJson = require('convert-csv-to-json');
const profileTaskConversionOptions = ['CyberSole', 'Project Destroyer', 'Hastey', 'EVE AIO', 'Phantom', 'Ghost', 'CSV', 'NSB', 'SOLE AIO'];
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
  billingAptorSuite: 'billing apt/suite',
  keywords: 'keywords',
  proxy: 'proxy',
  quantity: 'quantity'
};
import {
  cybersoleProfileToBase,
  projectDestroyerProfileToBase,
  ghostProfileToBase,
  balkoProfileToBase,
  eveaioProfileToBase,
  phantomProfileToBase,
  dasheProfileToBase,
  hasteyProfileToBase,
  kodaiProfileToBase,
  nsbProfileToBase,
  soleAioProfileToBase,
  baseProfileToProjectDestroyer,
  baseProfileToGhost,
  baseProfileToBalko,
  baseProfileToEveaio,
  baseProfileToPhantom,
  baseProfileToDashe,
  baseProfileToKodai,
  baseProfileToNsb,
  baseProfileToSoleAio
} from '../utils/profileConverters';
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
                    <div ref={provided.innerRef} className="col-12" style={{ padding: '0px', overflowY: 'scroll', maxHeight: '100%' }}>
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
                        this.state.draggableBoxes[this.state.mode][indexNumber].from,
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
    this.appendProfile(items);
  };

  baseProfileToCybersole = file => {
    let items = {};
    for (const profile of file) {
      items[profile.profileID] = {
        name: profile.profileID,
        payment: {
          email: profile.paymentEmail,
          phone: profile.phoneNumber,
          card: {
            name: profile.paymentCardholdersName,
            number: profile.paymentCardnumber,
            exp_month: profile.paymentCardExpiryMonth,
            exp_year: profile.paymentCardExpiryYear,
            cvv: profile.paymentCVV
          }
        },
        delivery: {
          first_name: profile.deliveryFirstName,
          last_name: profile.deliveryLastName,
          addr1: profile.deliveryAddress,
          addr2: profile.deliveryAddress2,
          zip: profile.deliveryZip,
          city: profile.deliveryCity,
          country: profile.deliveryCountry,
          state: profile.deliveryProvince,
          same_as_del: profile.deliverySameAsDelivery
        },
        billing: {
          first_name: profile.billingFirstName,
          last_name: profile.billingLastName,
          addr1: profile.billingAddress,
          addr2: profile.billingAddress2,
          zip: profile.billingZip,
          city: profile.billingCity,
          country: profile.billingCountry,
          state: profile.billingProvince,
          same_as_del: profile.billingSameAsDelivery
        },
        one_checkout: false,
        favourite: false
      };
    }
    this.saveToFile('CyberSole-Profiles', 'json', items);
  };

  baseProfileToPhoton = file => {
    let items = {};
    for (const profile of file) {
      items[profile.profileID] = {
        profileID: profile.profileID,
        deliveryCountry: profile.deliveryCountry,
        deliveryAddress: profile.deliveryAddress,
        deliveryCity: profile.deliveryCity,
        deliveryFirstName: profile.deliveryFirstName,
        deliveryLastName: profile.deliveryLastName,
        deliveryProvince: profile.deliveryProvince,
        deliveryZip: profile.deliveryZip,
        deliveryAptorSuite: profile.deliveryAptorSuite,
        billingZip: profile.billingZip,
        billingCountry: profile.billingCountry,
        billingAddress: profile.billingAddress,
        billingCity: profile.billingCity,
        billingFirstName: profile.billingFirstName,
        billingLastName: profile.billingLastName,
        billingProvince: profile.billingProvince,
        billingAptorSuite: profile.billingAptorSuite,
        phoneNumber: profile.phoneNumber,
        paymentEmail: profile.paymentEmail,
        paymentCardholdersName: profile.paymentCardholdersName,
        paymentCardnumber: profile.paymentCardnumber,
        paymentCardExpiryMonth: profile.paymentCardExpiryMonth,
        paymentCardExpiryYear: profile.paymentCardExpiryYear,
        paymentCVV: profile.paymentCVV
      };
    }
    this.saveToFile('Photon-Profiles', 'json', items);
  };

  baseTaskToPhoton = file => {
    let items = [];
    for (const task of file) {
      items.push({
        task: {
          store: task.store !== undefined ? task.store : '',
          mode: task.mode !== undefined ? task.mode : '',
          modeInput: task.modeInput !== undefined ? task.modeInput : '',
          keywords: task.keywords !== undefined ? task.keywords : '',
          proxy: task.proxy !== undefined ? task.proxy : '',
          quantity: task.quantity !== undefined ? task.quantity : '',
          tasks: task.tasks !== undefined ? task.tasks : '',
          color: task.color !== undefined ? task.color : '',
          category: task.category !== undefined ? task.category : '',
          size: '',
          profile: '',
          keywordColor: '',
          scheduledTime: '',
          atcBypass: false,
          captchaBypass: false,
          monitorDelay: '',
          checkoutDelay: '',
          username: '',
          password: ''
        },
        profileID: ''
      });
    }
    this.saveToFile('Photon-Tasks', 'json', { tasks: items });
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

  saveProfiles = (fromBotName, botName, profilesArray) => {
    let formattedProfiles;
    if (['Project Destroyer', 'Hastey', 'EVE AIO', 'Phantom', 'CSV', 'NSB', 'SOLE AIO'].includes(botName)) {
      formattedProfiles = profilesArray;
    } else {
      formattedProfiles = {};
      profilesArray.forEach((profile, index) => {
        formattedProfiles[`${botName} - ${index}`] = profile;
      });
    }
    const file = JSON.stringify(formattedProfiles);
    let extension = 'json';
    if (botName === 'Kodai') {
      extension = 'txt';
    } else if (botName === 'CSV') {
      extension = 'csv';
    }
    dialog.showSaveDialog(
      {
        title: 'name',
        defaultPath: `~/${botName} Profiles (Converted From ${fromBotName}).${extension}`,
        filters: [{ name: `${botName} Profiles (Converted From ${fromBotName})`, extensions: [extension] }]
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

  appendProfile = profilesArray => {
    this.setState({
      draggableBoxes: {
        ...this.state.draggableBoxes,
        profiles: [...this.state.draggableBoxes.profiles, { items: profilesArray, from: this.state.bot, to: this.state.bot }]
      }
    });
  };

  appendTask = tasksArray => {
    this.setState({
      draggableBoxes: {
        ...this.state.draggableBoxes,
        tasks: [...this.state.draggableBoxes.tasks, { items: tasksArray, from: this.state.bot, to: this.state.bot }]
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
        key={`${name}-draggableListItem-${listIndex}-${this.state.mode === 'profiles' ? item.profileID : item.id}-${index}`}
        draggableId={`${name}-draggableListItem-${listIndex}-${this.state.mode === 'profiles' ? item.profileID : item.id}-${index}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Container fluid>
              <Row style={{ backgroundColor: '#1A36C4' }}>
                <Col xs="8" style={{ padding: '10px' }}>
                  {this.state.mode === 'profiles' ? item.profileID : `Task - ${item.id}`}
                </Col>
                {/* <Col xs="2" className="text-center">
                  <FontAwesome
                    name="edit"
                    style={{ padding: '10px' }}
                    onClick={() => {
                      this.editItem(name, index);
                    }}
                  />
                </Col> */}
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

  convertToBase = profiles => {
    let converteredProfiles;
    switch (this.state.bot) {
      case 'CyberSole':
        converteredProfiles = profiles.map((profile, index) => cybersoleProfileToBase(profile, index));
        break;
      case 'Project Destroyer':
        converteredProfiles = profiles.map((profile, index) => projectDestroyerProfileToBase(profile, index));
        break;
      case 'Ghost':
        converteredProfiles = profiles.map((profile, index) => ghostProfileToBase(profile, index));
        break;
      case 'Balko':
        converteredProfiles = profiles.map((profile, index) => balkoProfileToBase(profile, index));
        break;
      case 'EVE AIO':
        converteredProfiles = profiles.map((profile, index) => eveaioProfileToBase(profile, index));
        break;
      case 'Phantom':
        converteredProfiles = profiles.map((profile, index) => phantomProfileToBase(profile, index));
        break;
      case 'Dashe':
        converteredProfiles = profiles.map((profile, index) => dasheProfileToBase(profile, index));
        break;
      case 'Hastey':
        converteredProfiles = profiles.map((profile, index) => hasteyProfileToBase(profile, index));
        break;
      case 'Kodai':
        converteredProfiles = profiles.map((profile, index) => kodaiProfileToBase(profile, index));
        break;
      case 'NSB':
        converteredProfiles = profiles.map((profile, index) => nsbProfileToBase(profile, index));
        break;
      case 'SOLE AIO':
        converteredProfiles = profiles.map((profile, index) => soleAioProfileToBase(profile, index));
        break;
      case 'CSV':
        break;
      default:
        break;
    }
    if (converteredProfiles !== undefined) {
      this.appendProfile(converteredProfiles);
    }
  };

  readFile = files => {
    files.forEach(file => {
      const fileExtension = file.path.split('.').pop();
      if (fileExtension === 'json') {
        fs.readFile(file.path, 'utf-8', (err, data) => {
          if (!err) {
            const JSONFile = JSON.parse(data);
            let profiles;
            if (['Project Destroyer', 'Hastey', 'EVE AIO', 'Phantom', 'CSV', 'NSB', 'SOLE AIO'].includes(this.state.botType)) {
              profiles = JSONFile;
            } else {
              profiles = Object.values(JSONFile);
            }
            this.convertToBase(profiles);
          }
        });
      }
    });
  };

  convertToBot = (fromBotName, botName, profiles) => {
    if (this.state.mode == 'profiles') {
      let converteredProfiles;
      switch (botName) {
        case 'CyberSole':
          converteredProfiles = profiles.map((profile, index) => this.baseProfileToCybersole(profile, index));
          break;
        case 'Project Destroyer':
          converteredProfiles = profiles.map((profile, index) => baseProfileToProjectDestroyer(profile, index));
          break;
        case 'Ghost':
          converteredProfiles = profiles.map((profile, index) => baseProfileToGhost(profile, index));
          break;
        case 'Balko':
          converteredProfiles = profiles.map((profile, index) => baseProfileToBalko(profile, index));
          break;
        case 'EVE AIO':
          converteredProfiles = profiles.map((profile, index) => baseProfileToEveaio(profile, index));
          break;
        case 'Phantom':
          converteredProfiles = profiles.map((profile, index) => baseProfileToPhantom(profile, index));
          break;
        case 'Dashe':
          converteredProfiles = profiles.map((profile, index) => baseProfileToDashe(profile, index));
          break;
        case 'Hastey':
          converteredProfiles = profiles.map((profile, index) => baseProfileToHastey(profile, index));
          break;
        case 'Kodai':
          converteredProfiles = profiles.map((profile, index) => baseProfileToKodai(profile, index));
          break;
        case 'NSB':
          converteredProfiles = profiles.map((profile, index) => baseProfileToNsb(profile, index));
          break;
        case 'SOLE AIO':
          converteredProfiles = profiles.map((profile, index) => baseProfileToSoleAio(profile, index));
          break;
        case 'CSV':
          break;
        default:
          break;
      }
      if (converteredProfiles !== undefined) {
        this.saveProfiles(fromBotName, botName, converteredProfiles);
      }
    } else if (this.state.mode === 'tasks') {
      switch (botName) {
        case 'CyberSole':
          this.baseProfileToCybersole(file);
          break;
        case 'Photon':
          this.baseTaskToPhoton(file);
        default:
          break;
      }
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
        <Container fluid className="activeWindow d-flex flex-column">
          <Row>
            <div className="col-10">
              <Dropzone
                accept="application/json, text/csv"
                onDrop={accepted => {
                  this.readFile(accepted);
                  // this.convertToBase(accepted);
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
                value={this.state.bot}
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
                {/* <option>tasks</option> */}
              </Input>
            </Col>
          </Row>
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
        </Container>
      </CSSTransition>
    );
  }
}
