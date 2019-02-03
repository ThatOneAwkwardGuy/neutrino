export const ADD_ACCOUNT = 'ADD_ACCOUNT';
export const REMOVE_ACCOUNT = 'REMOVE_ACCOUNT';
export const REMOVE_ALL_ACCOUNTS = 'REMOVE_ALL_ACCOUNTS';

export function createAccount(account) {
  return {
    type: ADD_ACCOUNT,
    payload: account
  };
}

export function removeAccount(account) {
  return {
    type: REMOVE_ACCOUNT,
    payload: account
  };
}

export function removeAllAccounts() {
  return {
    type: REMOVE_ALL_ACCOUNTS
  };
}
