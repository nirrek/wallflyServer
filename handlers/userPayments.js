/**
 * Handlers for user payments resource.
 */
var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function userPayments(request, reply) {
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
 * @param {Number} userId  The id of the user.
 */
function getHandler(request, reply, userId){
    pool.getConnection(function(err, connection) {
      connection.query({
        sql: 'SELECT * FROM properties p, payments y ' +
             'WHERE y.propertyId = p.id AND y.tenantId = ? ' +
             'ORDER BY dateDue DESC',
        values: [userId],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err);

        // Put the result set in a more consumable form
        var massagedResults = results.map(function(row) {
          return {
            id: row.id,
            date: row.date,
            property: row.street + ', ' + row.suburb,
            amount: row.amount
          };
        });

        reply(massagedResults);
      });
    });
}

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 * @param {Number} userId  The id of the user.
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
        return reply(err);
      }
      var propertyId = results[0].id;

      connection.query({
        sql: 'INSERT INTO payments (amount, tenantId, propertyId)' +
             'VALUES (?, ?, ?)',
        values:[
          payload.amount,
          userId,
          propertyId
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          reply(err).code(500);
          return;
        }

        reply('Payment added successfully');
      });
    });
  });
}

module.exports = userPayments;
