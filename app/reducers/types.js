import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

export type counterStateType = {
  +counter: number
};

export type settingsStateType = {
  +proxyAccounts: {
    +google: Array<{
      +accountName: string,
      +projectID: string,
      +credentialsFilePath: string
    }>,
    +digitalOcean: Array<{ +accountName: string, +apiKey: string }>,
    +vultr: Array<{ +accountName: string, +apiKey: string }>
  }
};

export type Action = {
  +type: string
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
