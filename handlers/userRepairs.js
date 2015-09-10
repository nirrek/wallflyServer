var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function userRepairs(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT date, subject, request, photo ' +
           'FROM repair_requests WHERE tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      // Put the result set in a form for client consumption
      var massagedResults = results.map(function(row) {
        row.photo = getPhotoUrl(row.photo);
        return row;
      });

      reply(massagedResults);
    });
  });

}

module.exports = userRepairs;
