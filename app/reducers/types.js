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
  +update: {
    status: string,
    releaseDate: integer,
    lastChecked: string,
    changelog: string,
    version: string
  },
  +activityDelayMin: string,
  +activityDelayMax: string,
  +showAcitivtyWindows: boolean,
  +activityGoogleSearch: boolean,
  +activityGoogleNews: boolean,
  +activityGoogleShopping: boolean,
  +activityYoutube: boolean
};

export type homeStateType = {
  +rafflesEntered: number,
  +proxiesCreates: number,
  +accountsCreated: number
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

export type profileStateType = {
  +sameDeliveryBillingBool: boolean,
  +oneCheckoutBool: boolean,
  +randomNameBool: boolean,
  +randomPhoneNumberBool: boolean,
  +useCatchallBool: boolean,
  +jigAddressesBool: boolean,
  +fourCharPrefixBool: boolean,
  +randomPhoneNumberTemplate: string,
  +email: string,
  +phone: string,
  +deliveryAddress: string,
  +deliveryFirstName: string,
  +deliveryLastName: string,
  +deliveryCity: string,
  +deliveryApt: string,
  +deliveryCountry: string,
  +deliveryRegion: string,
  +deliveryZip: string,
  +billingAddress: string,
  +billingFirstName: string,
  +billingLastName: string,
  +billingCity: string,
  +billingApt: string,
  +billingCountry: string,
  +billingRegion: string,
  +billingZip: string
};

export type Action = {
  +type: string
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
