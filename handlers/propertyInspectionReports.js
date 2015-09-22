var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyInspectionReports(request, reply) {

  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);

}

function getHandler(request, reply) {
  var propertyId = request.params.propertyId;
  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.

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

function postHandler(request, reply) {
  var payload = request.payload;
  var userId = 6; //Temporary hardcoded - userid currently can't be passed via params

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
