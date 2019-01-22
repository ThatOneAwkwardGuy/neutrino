import { auth } from './firebase';

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const response = await auth.signInWithEmailAndPassword(email, password);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const authorise = auth;
