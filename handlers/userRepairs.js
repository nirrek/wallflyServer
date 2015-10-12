var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function userRepairs(request, reply) {
  var userId = request.params.userId;
  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  if      (request.method === 'get')  getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}

function getHandler(request, reply, userId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id, date, request, status ' +
           'FROM repair_requests WHERE tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err).code(500);
      reply(results);
    });
  });
}

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    var image = request.payload.image;
    var requesttId = request.payload.requestId;
    connection.query({
      sql: 'SELECT id FROM properties WHERE tenantId = ?',
      values: [userId]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }
      var propertyId = results[0].id;

      connection.query({
        sql: 'INSERT INTO repair_requests ' +
             '(request, tenantId, propertyId) ' +
             'VALUES (?, ?, ?)',
        values:[
          payload.description,
          userId,
          propertyId
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          reply(err).code(500);
          return;
        }
        var requestId = results[1].id;
        console.log(requestId);

          connection.query({
          sql: 'INSERT INTO repair_request_images ' +
               '(photo, requestId) ' +
               'VALUES (?, ?)',
          values:[
            image,
            requestId,
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
  });
}

module.exports = userRepairs;
