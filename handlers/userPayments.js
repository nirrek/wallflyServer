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
            date: row.date,
            property: row.street + ', ' + row.suburb,
            amount: row.amount
          };
        });

        reply(massagedResults);
      });
    });
}

function postHandler(request, reply, userId){  
    pool.getConnection(function(err, connection) {
      connection.query({
        sql: 'INSERT INTO payments (date, amount, tenantId, propertyId)' +
             'VALUES (?, ?, ?, ?)',
        values: [request.payload.date,
                request.payload.amount,
                userId,
                3]

        ],
      }, function(err, results) {
        connection.release();
        if (err) return reply(err);

        reply('Payment added successfully');
      });
    });
}



module.exports = userPayments;

