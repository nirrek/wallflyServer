var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

function propertyRepairRequests(request, reply) {
  var propertyId = request.params.propertyId;

  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.
  
  if (request.method === 'get') getHandler(request, reply, propertyId);
  else if (request.method === 'put') putHandler(request, reply, propertyId);
}

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
      } else {
        results = results.map(function(result) {
          result.photo = getPhotoUrl(result.photo)
          return result;
        });
      }
      reply(results);
    });
  });
}

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

