/**
 * Database.js
 * This module is thin wrapper around the database module. It allows for
 * initializing a connection pool with the database, and most importantly,
 * allows other modules to fetch a reference to the connection pool via
 * require('./database.js').getConnectionPool(...);
 */

var mysql = require('mysql');
var pool = null;

/**
 * Initializes a connection pool to the database.
 */
function initialize() {
  if (pool) return; // only initialize a single time.

  pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'wallfly'
  });

  // Ensure we can connect to the database
  pool.getConnection(function(err, connection) {
    if (err) return console.log('error connection: ' + err.stack);
  });
}

/**
 * Acquire a reference to the database connection pool.
 * @return {Object} The connection pool object.
 */
function getConnectionPool() {
  if (!pool) initialize(); // ensure a connection pool is always available.

  return pool;
}

module.exports = {
  initialize: initialize,
  getConnectionPool: getConnectionPool,
};
