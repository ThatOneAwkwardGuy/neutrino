// @flow
import {
  ADD_ACTIVITIES,
  UPDATE_ACTIVITY,
  INCREMENT_ACTIVITY,
  DELETE_ACTIVITY,
  DELETE_ALL_ACTIVITIES
} from '../actions/activities';

import type { activityStateType, Action } from './types';

export default function activities(
  state: activityStateType = { activities: [] },
  action: Action
) {
  switch (action.type) {
    case ADD_ACTIVITIES: {
      const addActivityState = { ...state };
      addActivityState.activities = [...state.activities, ...action.activities];
      return addActivityState;
    }
    case DELETE_ACTIVITY: {
      const deleteActivityState = { ...state };
      deleteActivityState.activities = state.activities.filter(
        (activity, index) => index !== action.index
      );
      return deleteActivityState;
    }
    case DELETE_ALL_ACTIVITIES: {
      const deleteAllActivityState = { ...state };
      deleteAllActivityState.activities = [];
      return deleteAllActivityState;
    }
    case UPDATE_ACTIVITY: {
      const updateActivityState = { ...state };
      const updatedActivities = updateActivityState.activities.map(
        (activity, index) =>
          index === action.index
            ? { ...activity, ...action.activity }
            : activity
      );
      updateActivityState.activities = updatedActivities;
      return updateActivityState;
    }
    case INCREMENT_ACTIVITY: {
      const incrementActivityState = { ...state };
      const incrementedActivities = incrementActivityState.activities.map(
        (activity, index) =>
          index === action.index
            ? {
                ...activity,
                [action.activityName]: activity[action.activityName] + 1,
                total: activity.total + 1
              }
            : activity
      );
      incrementActivityState.activities = incrementedActivities;
      return incrementActivityState;
    }
    default:
      return state;
  }
}
