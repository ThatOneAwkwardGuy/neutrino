export const UPDATE_PROFILE_ATTRIBUTE = 'UPDATE_PROFILE_ATTRIBUTE';
export const CLEAR_PROFILE_ATTRIBUTES = 'CLEAR_PROFILE_ATTRIBUTES';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';

export const updateProfileAttribute = (attributeName, value) => ({
  type: UPDATE_PROFILE_ATTRIBUTE,
  attributeName,
  value
});

export const clearProfileAttributes = () => ({
  type: CLEAR_PROFILE_ATTRIBUTES
});

export const updateProfile = profile => ({
  type: UPDATE_PROFILE,
  profile
});
