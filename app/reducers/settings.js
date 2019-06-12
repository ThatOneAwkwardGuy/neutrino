import { UPDATE_SETTINGS } from '../actions/settings';

const initialState = {
  activityDelayMin: 60000,
  activityDelayMax: 120000,
  googleCredentialsPath: '',
  googleCredentialsPojectID: '',
  vultrAPIKey: '',
  digitalOceanAPIKey: '',
  showAcitivtyWindows: false,
  update: {
    status: 'M',
    releaseDate: '',
    lastChecked: '',
    changelog: '',
    version: ''
  }
};

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return action.payload;
    default:
      return state;
  }
}
