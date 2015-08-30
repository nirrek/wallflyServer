var database = require('../database.js');
var Bcrypt = require('bcrypt');
var pool = database.getConnectionPool();

// Request handler for creating a new user
function userCreate(request, reply) {

  createUser(request.payload, function(error) {
    if (error) {
      // TODO
      reply(error).code(400);
      return;
    }

    reply({
      isSuccessful: true
    });
  });

}

// Inserts a new user into the database given the submitted payload.
function createUser(payload, callback) {
  var p = payload; // convenience

  pool.getConnection(function(err, connection) {
    connection.query({
      // Fetch the current userTypes in the database.
      sql: 'SELECT * FROM `user_types` where type = ?',
      values: [p.userType],
    }, function(error, results) {
      if (error) {
        console.log(error);
        connection.release();
        return callback(error);
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

        if (error) {
          console.log(error);

          // hapi will complain if we try to return the error object as one of
          // the property names `code` has another meaning in hapi responses
          var nonconflictError = {
            errorType: error.code,
            errorMessage: error.message,
          }
          return callback(nonconflictError);
        }

        callback(null);
      });
    });
  });
}

module.exports = userCreate;
