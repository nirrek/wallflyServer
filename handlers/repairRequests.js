var database = require('../database.js');
var pool = database.getConnectionPool();

function repairRequests(request, reply) {
  var agentId = request.query.agentId;

  if (agentId !== request.auth.artifacts.id) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'SELECT * FROM repair_requests ' +
           'WHERE propertyId IN (SELECT id FROM properties WHERE agentId=?) ' +
           'ORDER BY date DESC',
      values: [agentId],
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);

      reply(results);
    });
  });
}

module.exports = repairRequests;
