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

      reply(results);
    });
  });

}

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM users WHERE email = ? AND userType = 3',
      values: [payload.ownerEmail]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err).code(500);
      } else if (!results[0]) {
        connection.release();
        var error = new Error('No owner with email: ' + payload.ownerEmail);
        return reply(error.toString()).code(500);
      }
      var ownerUser = results[0].id;

      if (payload.tenantEmail != '') {
        connection.query({
          sql: 'SELECT id FROM users WHERE email = ? AND userType = 1',
          values: [payload.tenantEmail]
        }, function(err, results) {
          if (err) {
            connection.release();
            return reply(err).code(500);
          } else if (!results[0]) {
            connection.release();
            var error = new Error('No tenant with email: ' + payload.tenantEmail);
            return reply(error.toString()).code(500);
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
      }

      else {
        connection.query({
          sql: 'INSERT INTO properties ' +
               '(agentId, ownerId, postcode, street, suburb, tenantId, photo) ' +
               'VALUES (?, ?, ?, ?, ?, NULL, ?)',
          values:[
            userId,
            ownerUser,
            payload.postCode,
            payload.streetAddress,
            payload.suburb,
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
      }
    });
  });

}

module.exports = properties;
