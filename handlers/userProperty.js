var config = require('../config.js');
var getPhotoUrl = require('../utils.js').getPhotoUrl;
var database = require('../database.js');
var pool = database.getConnectionPool();

function userProperty(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT street, suburb, postcode, photo, tenant.firstName as tenantFN, tenant.lastName as tenantLN, tenant.phone as tenantPhone, tenant.email as tenantEmail, ' +
           'agent.firstName as agentFN, agent.lastName as agentLN, agent.phone as agentPhone, agent.email as agentEmail, ' +
           'owner.firstName as ownerFN, owner.lastName as ownerLN, owner.phone as ownerPhone, owner.email as ownerEmail ' +
           'FROM properties p, users tenant, users agent, users owner ' +
           'WHERE tenantId = ? ' +
             'AND p.tenantId = tenant.id ' +
             'AND p.agentId = agent.id ' +
             'AND p.ownerId = owner.id',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      var result = results[0];
      reply(result);
    });
  });

}

module.exports = userProperty;

