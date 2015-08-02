var database = require('../database.js');
var Bcrypt = require('bcrypt');
var pool = database.getConnectionPool();

// Request handler for creating a new user
function userCreate(request, reply) {

  createUser(request.payload, function(error) {
    if (error) {
      // TODO
      reply(error);
    }

    reply('User created!');
  });

}

// Inserts a new user into the database given the submitted payload.
function createUser(payload, callback) {
  var p = payload; // convenience

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM `userTypes` where type = ?',
      values: [payload.userType],
    }, function(error, results) {
      if (error) {
        connection.release();
        callback(error);
      }

      var userTypeId = results[0].id;

      // The salt will be incorporated into the hash, so need not be stored
      // separately in the database. The compare function will know how to extract
      // the embedded salt during comparison.
      var salt = Bcrypt.genSaltSync(8);
      var hash = Bcrypt.hashSync(p.password, salt);

      // Insert the new user into the DB
      connection.query({
        sql: 'INSERT INTO `users` (username, password, firstName, lastName, phone, email, userType) ' +
             'VALUES(?, ?, ?, ?, ?, ?, ?)',
        values: [p.username, hash, p.firstName, p.lastName, p.phone, p.email, userTypeId],
      }, function(error, results) {
        connection.release();
        callback(error);
      });
    });
  });
}

module.exports = userCreate;
