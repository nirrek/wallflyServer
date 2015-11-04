/**
 * Handlers for property payments resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function propertyPayments(request, reply) {
  var propertyId = request.params.propertyId;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM payments WHERE propertyId = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyPayments.js', err);
        return reply('Error').code(500);
      }

      if (results.length === 0) {
        console.log('No result for propertyId = ' + propertyId)
      }
      reply(results);
    });
  });
}

module.exports = propertyPayments;

