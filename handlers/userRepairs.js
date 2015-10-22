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
      sql:
        'SELECT r.id, r.date, r.request, r.status, r.tenantId, r.propertyId, r.priority, i.id AS photoId, i.photo ' +
        'FROM repair_requests r, repair_request_images i ' +
        'WHERE r.tenantId = ? AND i.requestId = r.id',
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
    connection.query({
      sql: 'SELECT id FROM properties WHERE tenantId = ?',
      values: [userId]
    }, function(err, results) {
      if (err) {
        return reply(err.toString()).code(500);
      }
      var propertyId = results[0].id;

      connection.query({
        sql: 'INSERT INTO repair_requests ' +
             '(request, tenantId, propertyId, priority) ' +
             'VALUES (?, ?, ?, ?)',
        values:[
          payload.request,
          userId,
          propertyId,
          payload.priority,
        ],
      }, function(err, results) {
        if (err) {
          reply(err.toString()).code(500);
          return;
        }
        connection.query({
          sql: 'SELECT LAST_INSERT_ID() as lastRequestId;'
        }, function(err, res) {
          if (err) {
            reply(err).code(500);
            return;
          }
          var requestId = res[0].lastRequestId;
            connection.query({
            sql: 'INSERT INTO repair_request_images ' +
                 '(photo, requestId) ' +
                 'VALUES (?, ?)',
            values:[
              payload.image,
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
  });
}

module.exports = userRepairs;
