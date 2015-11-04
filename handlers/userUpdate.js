/**
 * Handler for updating a user resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * PUT handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function userUpdate(request, reply) {
  var userId = request.params.userId;
  var username = request.payload.username;
  var firstName = request.payload.firstName
  var lastName = request.payload.lastName
  var phone = request.payload.phone
  var email = request.payload.email
  var avatar = request.payload.avatar

  if (request.auth.artifacts.id !== userId) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'UPDATE users ' +
           'SET username = ?, ' +
           'firstName = ?, ' +
           'lastName = ?, ' +
           'phone = ?, ' +
           'email = ?, ' +
           'avatar = ? ' +
           'WHERE id = ?',
      values: [username, firstName, lastName, phone, email, avatar, userId],
    }, function(err, results) {
      conn.release();

      if (err) return reply(err.toString()).code(500);
      return reply('User updated');
    });
  });
}

module.exports = userUpdate;
