var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Handler for individual repair request records.
 */
function repairRequest(request, reply) {
  var p = request.payload;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'UPDATE repair_requests ' +
           'SET id = ? ,' +
           '    date = ? ,' +
           '    request = ? ,' +
           '    photo = ? ,' +
           '    status = ? ,' +
           '    tenantId = ? ,' +
           '    propertyId = ? ,' +
           '    priority = ? ' +
           'WHERE id = ?',
      values: [p.id, p.date, p.request, p.photo, p.status, p.tenantId,
        p.propertyId, p.priority, request.params.repairRequestId
      ],
    }, function(err, results) {
      conn.release();
      if (err) {
        console.log(err);
        return reply(err.toString()).code(500);
      }

      reply('Successfully updated');
    });
  });
}

module.exports = repairRequest;
