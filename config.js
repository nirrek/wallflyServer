/**
 * General configuration options for the server.
 */
module.exports = {
  host: '0.0.0.0',
  port: 8000,
  urlRoot: 'http://127.0.0.1:8000',
  // robust util for getting app root across all runtime environments.
  appRoot: require('app-root-path').toString(),
};
