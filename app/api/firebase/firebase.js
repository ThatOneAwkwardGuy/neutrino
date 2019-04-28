// import * as firebase from "firebase";
// import firebase from "@firebase/app";

var firebase = require('firebase').default;
require('firebase/auth').default;
require('firebase/database').default;
require('firebase/firestore').default;
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const prodConfig = {
  apiKey: 'AIzaSyDlzPKlXXaSbLAibvNXjVUWfi90n2paZ9U',
  authDomain: 'neutrino-tools.firebaseapp.com',
  databaseURL: 'https://neutrino-tools.firebaseio.com',
  projectId: 'neutrino-tools',
  storageBucket: 'neutrino-tools.appspot.com',
  messagingSenderId: '683216035842'
};

// const prodConfig = {
//   apiKey: 'AIzaSyBIhzR3KT792-UJBRNgd2wmM9exbZsZh3I',
//   authDomain: 'photon-bot.firebaseapp.com',
//   databaseURL: 'https://photon-bot.firebaseio.com',
//   projectId: 'photon-bot',
//   storageBucket: 'photon-bot.appspot.com',
//   messagingSenderId: '518062381695'
// };

// const config = process.env.NODE_ENV === "production" ? prodConfig : devConfig;

// if (!firebase.apps.length) {
//   firebase.initializeApp(config);
// }

firebase.initializeApp(prodConfig);

const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

export { auth, database, firestore };
