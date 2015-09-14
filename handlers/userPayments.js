var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

function userPayments(request, reply) {
  var userId = request.params.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  if (request.method === 'get') getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}


function getHandler(request, reply, userId){
    pool.getConnection(function(err, connection) {
      connection.query({
        sql: 'SELECT * FROM payments y, properties p ' +
             'WHERE y.propertyId = p.id AND y.tenantId = ?',
        values: [userId],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err);

        // Put the result set in a more consumable form
        var massagedResults = results.map(function(row) {
          return {
            id: row.id,
            date: row.date,
            property: row.street + ', ' + row.suburb,
            amount: row.amount
          };
        });

        reply(massagedResults);
      });
    });
}

function postHandler(request, reply, userId) {
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM properties WHERE tenantId = ?',
      values: [userId]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err);
      }
      var propertyId = results[0].id;

      connection.query({
        sql: 'INSERT INTO payments (amount, tenantId, propertyId)' +
             'VALUES (?, ?, ?)',
        values:[
          payload.amount,
          userId,
          propertyId
        ],
      }, function(err, results) {
        connection.release();
        if (err) {
          reply(err).code(500);
          return;
        }

        reply('Payment added successfully');
      });
    });
  });
}

module.exports = userPayments;
