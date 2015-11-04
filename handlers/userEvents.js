/**
 * Handler for user events resource.
 */
var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function userEvents(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * ' +
           'FROM events e, properties p ' +
           'WHERE e.propertyId = p.id and p.tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log(err);
        return reply(err);
      }

      reply(results);
    });
  });

}

module.exports = userEvents;
