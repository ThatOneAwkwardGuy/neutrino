import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';

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

export const doSignInWithEmailAndPassword = async (email, password) =>
  await auth.signInWithEmailAndPassword(email, password);

export const signOut = () => auth.signOut();

export const getAuth = () => auth;

export const getFirestore = () => firestore;
