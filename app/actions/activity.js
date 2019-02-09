export const ADD_ACTIVITY = 'ADD_ACTIVITY';
export const REMOVE_ACTIVITY = 'REMOVE_ACTIVITY';
export const REMOVE_ALL_ACTIVITIES = 'REMOVE_ALL_ACTIVITIES';
export const UPDATE_ACTIVITY = 'UPDATE_ACTIVITY';

export function createActivity(activity) {
  return {
    type: ADD_ACTIVITY,
    payload: activity
  };
}

export function removeActivity(activity) {
  return {
    type: REMOVE_ACTIVITY,
    payload: activity
  };
}

export function removeAllActivities() {
  return {
    type: REMOVE_ALL_ACTIVITIES
  };
}

export function updateActivity({ index, activity }) {
  return {
    type: UPDATE_ACTIVITY,
    payload: {
      index,
      activity
    }
  };
}
