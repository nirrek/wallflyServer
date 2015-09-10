var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyCalendarEvents(request, reply) {
  var propertyId = request.params.propertyId;

  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM events WHERE propertyId = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyCalendarEvents.js', err);
        return reply('Error').code(500);
      }

      if (results.length === 0) {
        console.log('No result for propertyId = ' + propertyId)
      }
      reply(results);
    });
  });

}

module.exports = propertyCalendarEvents;

