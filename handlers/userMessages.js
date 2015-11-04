/**
 * Handlers for user messages resource.
 */
var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function userMessages(request, reply) {
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
    // Find the tenant's current agent for the property
    connection.query({
      sql: 'SELECT agentId FROM properties WHERE tenantId = ?',
      values: [userId]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }

      var agentId = results[0].agentId;

      // Find any messages exchanged between the tenant and agent
      connection.query({
        sql: 'SELECT * ' +
             'FROM messages ' +
             'WHERE sender = ? AND receiver = ? ' +
                'OR receiver = ? AND sender = ?',
        values: [userId, agentId, userId, agentId],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err);

        reply({
          tenant: userId,
          agent: agentId,
          messages: results,
        });
      });
    });

  });
}

/**
 * POST handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function postHandler(request, reply, userId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'INSERT INTO messages (sender, receiver, message) ' +
           'VALUES (?, ?, ?)',
      values: [request.payload.sender, request.payload.receiver, request.payload.message],
    }, function(err, results) {
      connection.release();
      if (err) reply(err);

      reply('Message added successfully');
    });
  });
}

module.exports = userMessages;
