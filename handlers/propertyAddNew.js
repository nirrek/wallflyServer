var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function propertyAddNew(request, reply) {
  var userId = request.params.userId;
  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  if (request.method === 'post') postHandler(request, reply, userId);
}

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM users WHERE userType = ? AND email = ?',
      values: [
        3,
        payload.ownerEmail,
      ]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }
      var ownerId = results[0].id;

      connection.query({
        sql: 'INSERT INTO properties ' +
             '(agentId, ownerId, photo, postcode, street, suburb, tenantId) ' +
             'VALUES (?, ?, ?, ?, ?, ?, ?)',
        values:[
          userId,
          ownerId,
          payload.dataUri,
          payload.postCode,
          payload.streetAddress,
          payload.suburb,
          null,
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          reply(err).code(500);
          return;
        }

        reply('Repair Request added successfully');
      });
    });
  });


}

module.exports = propertyAddNew;
