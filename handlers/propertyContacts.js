var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyContacts(request, reply) {
  var userId = request.auth.artifacts.id;
  var propertyId = request.params.propertyId;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'SELECT * FROM `user_types` ut, `users` u '
         + 'where u.userType = ut.id AND u.id = ?',
      values: [userId],
    }, function(err, results) {
      if (err) {
        conn.release();
        return reply('db error').code(500);
      }
      var user = results[0];

      conn.query({
        sql: 'SELECT tenantId, agentId, ownerId FROM properties WHERE id = ?',
        values: [propertyId],
      }, function(err, results) {
        conn.release();
        if (err) return reply('db error').code(500);
        var result = results[0];
        if (!result) return reply({});

        // Remove data based upon user type of the requester.
        if      (user.type === 'tenant') delete result.ownerId;
        else if (user.type === 'owner')  delete result.tenantId;

        reply(result);
      });
    });
  });
}

module.exports = propertyContacts;
