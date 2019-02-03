import { UPDATE_SETTINGS } from '../actions/settings';

const initialState = {
  googleCredentialsPath: '',
  googleCredentialsPojectID: '',
  awsAccessKey: '',
  awsSecretKey: '',
  vultrAPIKey: '',
  digitalOceanAPIKey: ''
};

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return action.payload;
    default:
      return state;
  }
}
