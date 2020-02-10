import * as firebase from 'firebase/app';
import undefined from 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/analytics';

import { machineIdSync } from 'node-machine-id';

const prodConfig = {
  apiKey: 'AIzaSyDlzPKlXXaSbLAibvNXjVUWfi90n2paZ9U',
  authDomain: 'neutrino-tools.firebaseapp.com',
  databaseURL: 'https://neutrino-tools.firebaseio.com',
  projectId: 'neutrino-tools',
  storageBucket: 'neutrino-tools.appspot.com',
  messagingSenderId: '683216035842',
  appId: '1:683216035842:web:a413cfe580477f2469c71b',
  measurementId: 'G-DV9GV5TWHR'
};

firebase.initializeApp(prodConfig);

const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const firestore = firebase.firestore();

export const doSignInWithEmailAndPassword = (email, password) =>
  auth.signInWithEmailAndPassword(email, password);

export const signOut = () => auth.signOut();

export const getAuth = () => auth;

export const getFirestore = () => firestore;

export const checkIfUserMachineIDMatches = async UID => {
  const response = await firestore
    .collection(`users`)
    .doc(UID)
    .get();
  const data = response.data();
  const { machineID } = data;
  const id = machineIdSync();
  if (id === machineID && data.status === 'active') {
    return {
      authorised: true,
      message: '',
      raffleBot: data.raffleBot
    };
  }
  if (data.status !== 'active') {
    auth.signOut();
    return {
      authorised: false,
      message:
        'It appears that your account is no longer active, this could be due to your subscription ending. If you require support feel free to contact us via the discord, twitter or support@neutrinotools.app'
    };
  }
  if (id !== machineID) {
    auth.signOut();
    return {
      authorised: false,
      message:
        'It appears that your account is bound to another machine. If you would like to run Neutrino on a new machine. Log in to neutrinotools.app and un-bind your account'
    };
  }
  auth.signOut();
  return { authorised: false, message: 'There was an problem ' };
};

export const setUserMachineIDOnFirstLoad = async UID => {
  const id = machineIdSync();
  const response = await firestore
    .collection('users')
    .doc(UID)
    .get();
  const userData = response.data();
  if (userData.machineID === undefined) {
    firestore
      .collection('users')
      .doc(UID)
      .update({
        machineID: id
      });
  }
};
