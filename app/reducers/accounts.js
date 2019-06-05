import { ADD_ACCOUNT, REMOVE_ACCOUNT, REMOVE_ALL_ACCOUNTS } from '../actions/accounts';

const initialState = {
  accounts: []
};

const accountsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ACCOUNT:
      return { accounts: [...state.accounts, action.payload] };
    case REMOVE_ACCOUNT:
      return { accounts: state.accounts.filter(account => account.email !== action.payload.email) };
    case REMOVE_ALL_ACCOUNTS:
      return { accounts: [] };
    default:
      return state;
  }
};

export default accountsReducer;
