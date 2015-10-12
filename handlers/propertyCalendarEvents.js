var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyCalendarEvents(request, reply) {

  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);

}
function getHandler(request, reply) {
  var propertyId = request.params.propertyId;

  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM events WHERE propertyId = ? ORDER BY date ASC',
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

function postHandler(request, reply) {
  var payload = request.payload;
  var dateTime = new Date(payload.date.toDateString() + ' ' + payload.time.toTimeString());
  var propertyId = request.params.propertyId;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'INSERT INTO events ' +
           '(event, date, notes, propertyId) ' +
           'VALUES (?, ?, ?, ?)',
      values:[
        payload.eventDesc,
        dateTime,
        payload.notes,
        propertyId
      ],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyCalendarEvents.js', err);
        return reply('Error').code(500);
      }

      reply('Property Calendar Event added successfully');
    });
  });
}

module.exports = propertyCalendarEvents;
