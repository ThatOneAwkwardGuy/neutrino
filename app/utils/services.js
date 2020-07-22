const rp = require('request-promise').defaults({
  // baseUrl: 'http://neutrinotools.app/api'
  baseUrl: 'http://localhost:3001/api'
});

export const bs = {};

export const getExternalAuth = (authServer, key) =>
  rp({
    uri: 'externalAuth',
    json: true,
    method: 'POST',
    body: { authServer, key }
  });
