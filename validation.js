var Bcrypt = require('bcrypt');
var database = require('./database.js');
var pool = database.getConnectionPool();

function validate(request, username, password, callback) {

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM `users` where username = ?',
      values: [username],
    }, function(error, results) {
      connection.release();

      var user = results[0];
      if (!user) return callback(null, false);

      Bcrypt.compare(password, user.password, function(err, isValid) {
        // Remove user password hash before returning user model
        delete user.password;

        callback(err, isValid, user);
      });
    });
  });
}

module.exports = {
  validate: validate,
}
