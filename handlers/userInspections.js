/**
 * Handlers for user inspections resource.
 */
var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function userInspections(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM properties where tenantId = ?',
      values: [userId],
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }

      if (results.length === 0) {
        connection.release();
        return reply('No results');
      }

      connection.query({
        sql: 'SELECT date, i.photo, comments, firstName, lastName, street, suburb ' +
             'FROM inspections i, users u, properties p ' +
             'WHERE i.propertyId = ? AND i.inspectorId = u.id AND i.propertyId = p.id',
        values: [results[0].id],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err.toString()).code(500);

        var massagedResults = results.map(function(row) {
          return {
            date: row.date,
            property: row.street + ', ' + row.suburb,
            inspector: row.firstName + ' ' + row.lastName,
            comments: row.comments,
            photo: row.photo,
          };
        });

        reply(massagedResults);
      });
    });
  });

}

module.exports = userInspections;
