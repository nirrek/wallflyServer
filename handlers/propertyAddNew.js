var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function propertyAddNew(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this').code(401);
  }

  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM users WHERE email = ?',
      values: [payload.ownerEmail]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }
      var ownerUser = results[0].id;

      connection.query({
        sql: 'SELECT id FROM users WHERE email = ?',
        values: [payload.tenantEmail]
      }, function(err, results) {
        if (err) {
          connection.release();
          return reply(err);
        }
        var tenantUser = results[0].id;

          connection.query({
            sql: 'INSERT INTO properties ' +
                 '(agentId, ownerId, postcode, street, suburb, tenantId, photo) ' +
                 'VALUES (?, ?, ?, ?, ?, ?, ?)',
            values:[
              userId,
              ownerUser,
              payload.postCode,
              payload.streetAddress,
              payload.suburb,
              tenantUser,
              payload.dataUrl,
            ],
          }, function(err, results) {
            connection.release();
            if (err) {
              reply(err).code(500);
              return;
            }

          reply('Property added successfully');
        });
      });
    });
  });
}

module.exports = propertyAddNew;
