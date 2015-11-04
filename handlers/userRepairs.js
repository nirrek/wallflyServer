/**
 * Handlers for the user repairs resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function userRepairs(request, reply) {
  var userId = request.params.userId;
  if (request.auth.artifacts.id !== userId) {
    return reply('Not authorized').code(401);
  }

  if      (request.method === 'get')  getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function getHandler(request, reply, userId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * ' +
           'FROM repair_requests WHERE tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err).code(500);
      reply(results);
    });
  });
}

/**
 * POST handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM properties WHERE tenantId = ?',
      values: [userId]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err.toString()).code(500);
      }
      var propertyId = results[0].id;

      connection.query({
        sql: 'INSERT INTO repair_requests ' +
             '(request, photo, tenantId, propertyId, priority) ' +
             'VALUES (?, ?, ?, ?, ?)',
        values:[
          payload.request,
          payload.image,
          userId,
          propertyId,
          payload.priority,
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          reply(err.toString()).code(500);
          return;
        }

        reply('Repair Request added successfully');
      });
    });
  });
}

module.exports = userRepairs;
