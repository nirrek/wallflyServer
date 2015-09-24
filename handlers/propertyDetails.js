var getPhotoUrl = require('../utils.js').getPhotoUrl;
var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyDetails(request, reply) {
  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);
}

function getHandler(request, reply, propertyId) {
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
      if (!result) {
        console.log('No result for propertyId = ' + propertyId)
      }
      reply(result);
    });
  });

}

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    if (payload.image == '') {
      connection.query({
        sql: 'SELECT id FROM users WHERE email = ? AND userType = 1',
        values: [payload.tenantEmail]
      }, function(err, results) {
        if (err || !results[0]) {
          connection.release();
          return reply(err).code(500);
        }
        var tenantUser = results[0].id;

        connection.query({
          sql: 'UPDATE properties ' +
                 'SET tenantId = ? ' +
                 'WHERE id = ?',
          values: [
            tenantUser,
            payload.propertyId,
          ],
        }, function(err, results) {
          connection.release();
          if (err) {
            console.log('Error in propertyDetails.js', err);
            return reply('Error').code(500);
          }

          reply('Property updated successfully');
        });
      });
    }

    else if (payload.tenantEmail == '') {
      connection.query({
        sql: 'UPDATE properties ' +
               'SET photo = ? ' +
               'WHERE id = ?',
        values: [
          payload.image,
          payload.propertyId,
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          console.log('Error in propertyDetails.js', err);
          return reply('Error').code(500);
        }

        reply('Property updated successfully');
      });
    }

    else {
      connection.query({
        sql: 'SELECT id FROM users WHERE email = ? AND userType = 1',
        values: [payload.tenantEmail]
      }, function(err, results) {
        if (err || !results[0]) {
          connection.release();
          return reply(err).code(500);
        }
        var tenantUser = results[0].id;

        connection.query({
          sql: 'UPDATE properties ' +
                 'SET tenantId = ?, ' +
                 'photo = ? ' +
                 'WHERE id = ?',
          values: [
            tenantUser,
            payload.image,
            payload.propertyId,
          ],
        }, function(err, results) {
          connection.release();
          if (err) {
            console.log('Error in propertyDetails.js', err);
            return reply('Error').code(500);
          }

          reply('Property updated successfully');
        });
      });
    }
  });

}

module.exports = propertyDetails;
