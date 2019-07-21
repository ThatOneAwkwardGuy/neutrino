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
    +digitalocean: Array<{ +accountName: string, +apiKey: string }>,
    +vultr: Array<{ +accountName: string, +apiKey: string }>
  },
  +activityDelayMin: string,
  +activityDelayMax: string,
  +showAcitivtyWindows: boolean,
  +activityGoogleSearch: boolean,
  +activityGoogleNews: boolean,
  +activityGoogleShopping: boolean,
  +activityYoutube: boolean
};

export type accountsStateType = {
  +accounts: Array<{
    +email: string,
    +site: string,
    +pass: string,
    +status: string
  }>
};

export type activityStateType = {
  +activities: Array<{
    +email: string,
    +pass: string,
    +proxy: string,
    +googleSearch: integer,
    +googleNews: integer,
    +googleShopping: integer,
    +youtube: integer,
    +total: integer,
    +status: string
  }>
};

export type Action = {
  +type: string
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
