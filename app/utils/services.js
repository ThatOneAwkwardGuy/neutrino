const rp = require('request-promise').defaults({
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001/api/'
      : 'http://neutrinotools.app/api'
});

export const bs = {};

export const getExternalAuth = (authServer, key) =>
  rp({
    uri: 'externalAuth',
    json: true,
    method: 'POST',
    body: { authServer, key }
  });
