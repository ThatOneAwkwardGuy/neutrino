const firebase = require('firebase').default;
require('firebase/auth').default;
require('firebase/database').default;
require('firebase/firestore').default;
// global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const prodConfig = {
  apiKey: 'AIzaSyDlzPKlXXaSbLAibvNXjVUWfi90n2paZ9U',
  authDomain: 'neutrino-tools.firebaseapp.com',
  databaseURL: 'https://neutrino-tools.firebaseio.com',
  projectId: 'neutrino-tools',
  storageBucket: 'neutrino-tools.appspot.com',
  messagingSenderId: '683216035842'
};

firebase.initializeApp(prodConfig);

const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

export { auth, database, firestore };
