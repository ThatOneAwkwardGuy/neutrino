export const ADD_ACTIVITIES = 'ADD_ACTIVITIES';
export const DELETE_ACTIVITY = 'DELETE_ACTIVITY';
export const DELETE_ALL_ACTIVITIES = 'DELETE_ALL_ACTIVITIES';
export const UPDATE_ACTIVITY = 'UPDATE_ACTIVITY';
export const INCREMENT_ACTIVITY = 'INCREMENT_ACTIVITY';

export const addActivities = activities => ({
  type: ADD_ACTIVITIES,
  activities
});

export const deleteActivity = index => ({
  type: DELETE_ACTIVITY,
  index
});

export const deleteAllActivities = () => ({
  type: DELETE_ALL_ACTIVITIES
});

export const updateActivity = (index, activity) => ({
  type: UPDATE_ACTIVITY,
  index,
  activity
});

export const incrementActivity = (index, activityName) => ({
  type: INCREMENT_ACTIVITY,
  index,
  activityName
});
