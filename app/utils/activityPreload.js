const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');

const currentWindow = windowManager.getCurrent();
const name = currentWindow.name;
const data = windowManager.sharedData.fetch(currentWindow.name);
const updateFunction = data.update;
const activity = data.data;

setActivityToRunning = () => {
  activity.status = 'Started';
  updateFunction({ index: name.split('-')[1], activity });
};

loginToGoogle = () => {
  window.location.assign('https://accounts.google.com/Login');
  //   document.addEventListener('DOMContentLoaded', function(event) {
  //     document.querySelector('input[name="Email"]').value = activity.email;
  //     document.querySelector('input[name="signIn"]').click();
  //   });
};

document.addEventListener('DOMContentLoaded', function(event) {
  setActivityToRunning();
  loginToGoogle();
});
