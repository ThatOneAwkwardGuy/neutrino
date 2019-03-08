import { UPDATE_SETTINGS } from '../actions/settings';

const initialState = {
  activityDelayMin: 60000,
  activityDelayMax: 120000,
  googleCredentialsPath: '',
  googleCredentialsPojectID: '',
  awsAccessKey: '',
  awsSecretKey: '',
  vultrAPIKey: '',
  digitalOceanAPIKey: '',
  showAcitivtyWindows: false
};

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return action.payload;
    default:
      return state;
  }
}
