var getPhotoUrl = require('../utils.js').getPhotoUrl;
var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyDetails(request, reply) {
  var propertyId = request.params.propertyId;

  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * FROM properties p WHERE p.id = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in propertyDetails.js', err);
        return reply('Error').code(500);
      }

      var result = results[0];
      if (result) {
        result.photo = getPhotoUrl(result.photo);
      } else {
        console.log('No result for propertyId = ' + propertyId)
      }
      reply(result);
    });
  });

}

module.exports = propertyDetails;

