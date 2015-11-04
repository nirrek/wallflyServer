/**
 * Handlers for property events resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function propertyCalendarEvents(request, reply) {

  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);

}

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function getHandler(request, reply) {
  var propertyId = request.params.propertyId;

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

/**
 * POST handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
function postHandler(request, reply) {
  var payload = request.payload;
  var datetime = payload.date;
  var propertyId = request.params.propertyId;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'INSERT INTO events ' +
           '(event, date, notes, propertyId) ' +
           'VALUES (?, ?, ?, ?)',
      values:[
        payload.eventDesc,
        datetime,
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
