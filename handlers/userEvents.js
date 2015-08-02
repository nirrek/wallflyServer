var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

function userEvents(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT date, event ' +
           'FROM events e, properties p ' +
           'WHERE e.propertyId = p.id and p.tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      reply(results);
    });
  });

}

module.exports = userEvents;
