var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function properties(request, reply) {
  var userId = request.query.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this').code(401);
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * ' +
           'FROM properties p ' +
           'WHERE p.agentId = ? OR p.ownerId = ?',
      values: [userId, userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      // Convert relative photo paths into URLs for all results.
      results.map(function(result) {
        result.photo = getPhotoUrl(result.photo);
        return result;
      });

      reply(results);
    });
  });

}

module.exports = properties;
