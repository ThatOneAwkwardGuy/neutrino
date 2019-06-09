import { auth } from './firebase';

export const doSignInWithEmailAndPassword = async (email, password) => {
  return await auth.signInWithEmailAndPassword(email, password);
};

export const signOut = async () => {
  return await auth.signOut();
};

export const authorise = auth;
