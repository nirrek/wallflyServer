/**
 * Validation module.
 * Responsible for authenticating a user.
 */
var Bcrypt = require('bcrypt');
var database = require('./database.js');
var pool = database.getConnectionPool();

/**
 * Validate the provided user
 * @param  {Object}   request  The current Hapi request object.
 * @param  {String}   username The user attempting to authenticate.
 * @param  {String}   password The provided password for authentication.
 * @param  {Function} callback Callback to be invoked once validation completes.
 */
function validate(request, username, password, callback) {

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM `user_types` ut, `users` u '
         + 'where u.userType = ut.id AND username = ?',
      values: [username],
    }, function(error, results) {
      connection.release();

      var user = results[0];
      if (!user) return callback(null, false);

      Bcrypt.compare(password, user.password, function(err, isValid) {
        // Remove user password hash before returning user model
        delete user.password;
        delete user.userType;

        callback(err, isValid, user);
      });
    });
  });
}

module.exports = {
  validate: validate,
}
