/**
 * Handlers for property inspection reports resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function propertyInspectionReports(request, reply) {
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
      sql: 'SELECT * FROM inspections WHERE propertyId = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyInspectionReports.js', err);
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
  var userId = request.auth.artifacts.id;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'INSERT INTO inspections ' +
           '(comments, photo, propertyId, inspectorId) ' +
           'VALUES (?, ?, ?, ?)',
      values:[
        payload.comments,
        payload.image,
        payload.propertyId,
        userId
      ],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyInspectionReports.js', err);
        return reply('Error').code(500);
      }

      reply('Property Inspection Report added successfully');
    });
  });
}

module.exports = propertyInspectionReports;
