// import React, { Component } from 'react';
// import { Row, Col, Container, Button } from 'reactstrap';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import PropTypes from 'prop-types';
// import Supreme from './Supreme';
// import { convertCSVToBase } from '../ProfileTaskEditorConverter/functions';
// import { convertBaseToNeutrino } from '../ProfileCreator/functions';

// import Table from '../Table/index';

// const { dialog } = require('electron').remote;
// const fs = require('fs');
// const csv = require('csvtojson');

// export default class RaffleBot extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       tasks: []
//       // profiles: []
//     };
//   }

//   // getRandomProxy = () => {
//   //   const { proxies } = this.state;
//   //   const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
//   //   const splitRandomProxy =
//   //     randomProxy !== undefined ? randomProxy.split(':') : undefined;
//   //   if (splitRandomProxy.length === 2) {
//   //     return `http://${splitRandomProxy[0]}:${splitRandomProxy[1]}`;
//   //   }
//   //   if (splitRandomProxy.length === 4) {
//   //     return `http://${splitRandomProxy[2]}:${splitRandomProxy[3]}@${
//   //       splitRandomProxy[0]
//   //     }:${splitRandomProxy[1]}`;
//   //   }
//   //   return '';
//   // };

//   // importProfiles = async () => {
//   //   const filePaths = await dialog.showOpenDialog({
//   //     filters: [{ name: 'Neutrino Profiles', extensions: ['json', 'csv'] }]
//   //   });
//   //   if (!filePaths.canceled) {
//   //     const filePath = filePaths.filePaths[0];
//   //     try {
//   //       const extension = filePath
//   //         .split('.')
//   //         .slice(-1)[0]
//   //         .toLowerCase();
//   //       let jsonContent;
//   //       if (extension === 'csv') {
//   //         const convertedCSV = await csv().fromFile(filePath);
//   //         jsonContent = convertedCSV.map((profile, index) => {
//   //           const baseProfile = convertCSVToBase(profile);
//   //           return convertBaseToNeutrino(
//   //             index,
//   //             baseProfile,
//   //             baseProfile.card,
//   //             '',
//   //             ''
//   //           );
//   //         });
//   //       } else {
//   //         console.log(filePath);
//   //         const contents = fs.readFileSync(filePath);
//   //         jsonContent = JSON.parse(contents);
//   //       }
//   //       this.setState({
//   //         profiles: Object.values(jsonContent)
//   //       });
//   //     } catch (error) {
//   //       console.error(error);
//   //     }
//   //   }
//   // };

//   runTest = () => {
//     const profile = {
//       profileID: 'wive@outlook.com',
//       deliveryCountry: 'Australia',
//       deliveryAddress: '123 Test Street',
//       deliveryCity: 'Testing',
//       deliveryFirstName: 'Fannie',
//       deliveryLastName: 'Zoes',
//       deliveryRegion: 'Australian Capital Territory',
//       deliveryZip: '123456',
//       deliveryApt: '123',
//       billingZip: '123456',
//       billingCountry: 'Australia',
//       billingAddress: '123 Test Street',
//       billingCity: 'Testing',
//       billingFirstName: 'John',
//       billingLastName: 'Doe',
//       billingRegion: 'Australian Capital Territory',
//       billingApt: '123',
//       phone: '+4481287468',
//       card: {
//         paymentCardholdersName: 'Moyosoreoluwa George',
//         cardNumber: '4596548201605649',
//         expMonth: '09',
//         expYear: '2023',
//         cvv: '550'
//       },
//       email: 'wive@outlook.com',
//       password: 'dyhmkttnzh',
//       sameDeliveryBillingBool: true,
//       oneCheckoutBool: true,
//       randomNameBool: true,
//       randomPhoneNumberBool: true,
//       useCatchallBool: true,
//       jigAddressesBool: true,
//       fourCharPrefixBool: true
//     };
//     const supremeClass = new Supreme(
//       profile,
//       'Jackets',
//       'green',
//       'Medium',
//       '',
//       '',
//       '+perforated +bomber',
//       '',
//       '',
//       ''
//     );
//     supremeClass.run();
//   };

//   render() {
//     const { tasks } = this.state;
//     const columns = [
//       {
//         Header: '#',
//         Cell: row => <div>{row.row.index + 1}</div>,
//         width: 20
//       },
//       {
//         Header: 'Email',
//         accessor: 'profile.email'
//       },
//       {
//         Header: 'Name',
//         accessor: 'name'
//       },
//       {
//         Header: 'Style',
//         accessor: 'style.name'
//       },
//       {
//         Header: 'Size',
//         accessor: 'size.name'
//       },
//       {
//         Header: 'Status',
//         accessor: 'status'
//       },
//       {
//         Header: 'Actions',
//         Cell: row => (
//           <div>
//             <FontAwesomeIcon
//               className="mx-3"
//               icon="play"
//               onClick={() => {
//                 tasks[row.row.index].run = true;
//                 tasks[row.row.index].start();
//               }}
//             />
//             <FontAwesomeIcon
//               className="mx-3"
//               icon="stop"
//               onClick={() => {
//                 tasks[row.row.index].stop();
//               }}
//             />
//             <FontAwesomeIcon
//               className="mx-3"
//               icon="trash"
//               onClick={() => {
//                 this.deleteEntry(row);
//               }}
//             />
//           </div>
//         )
//       }
//     ];
//     return (
//       <Row className="h-100 p-0">
//         <Col className="h-100" xs="12">
//           <Container fluid className="p-0 h-100 d-flex flex-column">
//             <Row className="flex-1 overflow-hidden panel-middle">
//               <Col id="TableContainer" className="h-100">
//                 <Table data={tasks} columns={columns} />
//               </Col>
//             </Row>
//             <Row>
//               <Button onClick={this.runTest}>Test</Button>
//             </Row>
//           </Container>
//         </Col>
//       </Row>
//     );
//   }
// }

// RaffleBot.defaultProps = {
//   raffleInfo: {}
// };

// RaffleBot.propTypes = {
//   settings: PropTypes.objectOf(PropTypes.any).isRequired,
//   setLoading: PropTypes.func.isRequired,
//   setInfoModal: PropTypes.func.isRequired,
//   raffleInfo: PropTypes.shape({
//     store: PropTypes.string.isRequired,
//     link: PropTypes.string.isRequired
//   }),
//   setRaffleInfo: PropTypes.func.isRequired,
//   incrementRaffles: PropTypes.func.isRequired
// };
