var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

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
        row.photo = config.urlRoot + row.photo; // set absolute URL for photo
        return row;
      });

      reply(massagedResults);
    });
  });

}

module.exports = userRepairs;
