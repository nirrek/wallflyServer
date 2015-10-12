var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function userRepairs(request, reply) {
  var requestId = request.params.requestId;
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this').code(401);
  }

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
  var image = request.payload.image;
  var requesttId = request.payload.requestId;
  pool.getConnection(function(err, connection) {
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
      if (err) return reply(err).code(500);
      reply(results);
    });
  });
}

module.exports = userRepairs;
