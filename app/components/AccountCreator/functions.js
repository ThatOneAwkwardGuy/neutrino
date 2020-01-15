const request = require('request-promise');

export const getFormData = object => {
  const formData = new FormData();
  Object.keys(object).forEach(key => formData.append(key, object[key]));
  return formData;
};

export const bs = '';

export const randomNumberInRange = (min, max) =>
  Math.floor(Math.random() * max) + min;

export const getNikeUSMobileNumberGetSMSCode = async settings => {
  const response = await request.get(
    `http://api.getsmscode.com/usdo.php?action=getmobile&username=${settings.SMSAPIUsername}&token=${settings.GetSMSCodeAPIKey}&pid=1`
  );
  console.log(response);
};
