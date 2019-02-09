import { ADD_ACTIVITY, REMOVE_ACTIVITY, REMOVE_ALL_ACTIVITIES, UPDATE_ACTIVITY } from '../actions/activity';

const initialState = {
  activities: []
};

export default function activitiesReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ACTIVITY:
      return { activities: [...state.activities, action.payload] };
    case REMOVE_ACTIVITY:
      return { activities: state.activities.filter(activity => activity.activityEmail !== action.payload.activityEmail) };
    case REMOVE_ALL_ACTIVITIES:
      return { activities: [] };
    case UPDATE_ACTIVITY:
      return {
        activities: state.activities.map((activity, index) => {
          if (index == action.payload.index) {
            return action.payload.activity;
          } else {
            return activity;
          }
        })
      };
    default:
      return state;
  }
}
