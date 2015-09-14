var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function properties(request, reply) {
  var userId = request.query.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this').code(401);
  }

  if      (request.method === 'get')  getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}

function getHandler(request, reply, userId) {
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

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM users WHERE email = ?',
      values: [payload.ownerEmail]
    }, function(err, results) {
      if (err || !results[0]) {
        connection.release();
        return reply(err).code(500);
      }
      var ownerUser = results[0].id;

      connection.query({
        sql: 'SELECT id FROM users WHERE email = ?',
        values: [payload.tenantEmail]
      }, function(err, results) {
        if (err || !results[0]) {
          connection.release();
          return reply(err).code(500);
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

module.exports = properties;
