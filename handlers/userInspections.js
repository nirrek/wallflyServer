var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

function userInspections(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
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

      connection.query({
        sql: 'SELECT date, comments, firstName, lastName, street, suburb ' +
             'FROM inspections i, users u, properties p ' +
             'WHERE i.propertyId = ? AND i.inspectorId = u.id AND i.propertyId = p.id',
        values: [results[0].id],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err);

        var massagedResults = results.map(function(row) {
          return {
            date: row.date,
            property: row.street + ', ' + row.suburb,
            inspector: row.firstName + ' ' + row.lastName,
            comments: row.comments
          };
        });

        reply(massagedResults);
      });
    });
  });

}

module.exports = userInspections;
