// import * as firebase from "firebase";
// import firebase from "@firebase/app";

var firebase = require('firebase').default;
require('firebase/auth').default;
require('firebase/database').default;
require('firebase/firestore').default;
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const prodConfig = {
  apiKey: "AIzaSyDlzPKlXXaSbLAibvNXjVUWfi90n2paZ9U",
  authDomain: "neutrino-tools.firebaseapp.com",
  databaseURL: "https://neutrino-tools.firebaseio.com",
  projectId: "neutrino-tools",
  storageBucket: "neutrino-tools.appspot.com",
  messagingSenderId: "683216035842"
};

// const devConfig = {
//   apiKey: "AIzaSyDcRM2-gJ-5riqluic46EzSWkvBgFWA7lA",
//   authDomain: "photon-dev-7a3d4.firebaseapp.com",
//   databaseURL: "https://photon-dev-7a3d4.firebaseio.com",
//   projectId: "photon-dev-7a3d4",
//   storageBucket: "photon-dev-7a3d4.appspot.com",
//   messagingSenderId: "891547964320"
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
