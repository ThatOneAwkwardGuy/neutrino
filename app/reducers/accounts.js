// @flow
import {
  ADD_CREATED_ACCOUNT,
  REMOVE_CREATED_ACCOUNT,
  REMOVE_ALL_CREATED_ACCOUNTS
} from '../actions/accounts';

import type { accountsStateType, Action } from './types';

export default function accounts(
  state: accountsStateType = { accounts: [] },
  action: Action
) {
  switch (action.type) {
    case ADD_CREATED_ACCOUNT: {
      const addAccountState = { ...state };
      addAccountState.accounts.push(action.createdAccount);
      return addAccountState;
    }
    case REMOVE_CREATED_ACCOUNT: {
      const removeAccountState = { ...state };
      const filteredState = removeAccountState.accounts.filter(
        account =>
          account.email !== action.createdAccount.email &&
          account.site !== action.createdAccount.site
      );
      removeAccountState.accounts = filteredState;
      return removeAccountState;
    }
    case REMOVE_ALL_CREATED_ACCOUNTS: {
      const removeAllAccountsState = { ...state };
      removeAllAccountsState.accounts = [];
      return removeAllAccountsState;
    }
    default:
      return state;
  }
}
