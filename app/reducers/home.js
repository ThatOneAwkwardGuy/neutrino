// @flow
import {
  INCREMENT_RAFFLES,
  INCREMENT_PROXIES,
  INCREMENT_ACCOUNTS
} from '../actions/home';
import type { homeStateType, Action } from './types';

export default function home(
  state: homeStateType = {
    rafflesEntered: 0,
    proxiesCreates: 0,
    accountsCreated: 0
  },
  action: Action
) {
  switch (action.type) {
    case INCREMENT_RAFFLES: {
      const incrementRafflesState = { ...state };
      incrementRafflesState.rafflesEntered += 1;
      return incrementRafflesState;
    }
    case INCREMENT_PROXIES: {
      const incrementProxiesState = { ...state };
      incrementProxiesState.proxiesCreates += 1;
      return incrementProxiesState;
    }
    case INCREMENT_ACCOUNTS: {
      const incrementAccountsState = { ...state };
      incrementAccountsState.accountsCreated += 1;
      return incrementAccountsState;
    }
    default:
      return state;
  }
}
