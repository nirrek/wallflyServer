var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function userRepairs(request, reply) {
  var requestId = request.params.requestId;

  if      (request.method === 'get')  getHandler(request, reply, requestId);
  else if (request.method === 'post') postHandler(request, reply, requestId);
}

function getHandler(request, reply, requestId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id, photo ' +
           'FROM repair_request_images WHERE requestId = ?',
      values: [requestId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err).code(500);
      reply(results);
    });
  });
}

function postHandler(request, reply, requestId) {
  // var payload = request.payload;

  // pool.getConnection(function(err, connection) {
  //   connection.query({
  //     sql: 'SELECT id FROM properties WHERE tenantId = ?',
  //     values: [userId]
  //   }, function(err, results) {
  //     if (err) {
  //       connection.release();
  //       return reply(err);
  //     }
  //     var propertyId = results[0].id;

  //     connection.query({
  //       sql: 'INSERT INTO repair_requests ' +
  //            '(request, photo, tenantId, propertyId) ' +
  //            'VALUES (?, ?, ?, ?)',
  //       values:[
  //         payload.description,
  //         payload.image,
  //         userId,
  //         propertyId
  //       ],
  //     }, function(err, results) {
  //       connection.release();
  //       if (err) {
  //         reply(err).code(500);
  //         return;
  //       }

  //       reply('Repair Request added successfully');
  //     });
  //   });
  // });
}

module.exports = userRepairs;
