/**
 * Handler for fetching a user resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function userGet(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM `user_types` ut, `users` u '
         + 'where u.userType = ut.id AND u.id = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply('db error').code(500);

      var user = results[0];
      delete user.password; // remove sensitive data before returning.
      delete user.userType;
      reply(user);
    });
  });
}

module.exports = userGet;
