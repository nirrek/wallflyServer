/**
 * Handlers for property repair requests resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function propertyRepairRequests(request, reply) {
  var propertyId = request.params.propertyId;
  if      (request.method === 'get') getHandler(request, reply, propertyId);
  else if (request.method === 'put') putHandler(request, reply, propertyId);
}

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 * @param {Number} propertyId The id of the property to fetch the repair
 *                            requests for.
 */
function getHandler(request, reply, propertyId){
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM repair_requests WHERE propertyId = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyRepairRequests.js', err);
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
 * PUT handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 * @param {Number} propertyId The id of the property to update the repair
 *                            requests of.
 */
function putHandler(request, reply, propertyId){
  var repairStatus = request.payload.repairStatus;
  var requestId = request.payload.requestId;
  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'UPDATE repair_requests ' +
           'SET status = ? ' +
           'WHERE id = ? AND propertyId = ?',
      values: [repairStatus, requestId, propertyId],
    }, function(err, results) {
      conn.release();

      if (err) return reply(err.toString()).code(500);
      return reply('Request updated');
    });
  });
}

module.exports = propertyRepairRequests;

