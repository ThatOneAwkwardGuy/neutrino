export const ADD_CREATED_ACCOUNT = 'ADD_CREATED_ACCOUNT';
export const REMOVE_CREATED_ACCOUNT = 'REMOVE_CREATED_ACCOUNT';
export const REMOVE_ALL_CREATED_ACCOUNTS = 'REMOVE_ALL_CREATED_ACCOUNTS';

export const addCreatedAccount = createdAccount => ({
  type: ADD_CREATED_ACCOUNT,
  createdAccount
});

export const removeCreatedAccount = createdAccount => ({
  type: REMOVE_CREATED_ACCOUNT,
  createdAccount
});

export const removeAllCreatedAccounts = () => ({
  type: REMOVE_ALL_CREATED_ACCOUNTS
});
