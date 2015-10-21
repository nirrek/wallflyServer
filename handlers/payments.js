var database = require('../database.js');
var pool = database.getConnectionPool();

function payments(request, reply) {
  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);
}

function getHandler(request, reply) {
  var propertyId = request.query.propertyId;
  var userType = request.auth.artifacts.type;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'SELECT * FROM payments ' +
           'WHERE propertyId = ?',
      values: [propertyId]
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);

      if (userType === 'tenant') {
        results = results.filter(function(row) {
          return row.type === 'tenant';
        });
      }

      return reply(results);
    });
  });
}

function postHandler(request, reply) {
  var dateDue = request.payload.dateDue;
  var amount = request.payload.amount;
  var description = request.payload.description;
  var propertyId = request.payload.propertyId;
  var type = request.auth.artifacts.type;
  var isPaid = (type !== 'tenant'); // agent/owner added 'paid' by default.

  pool.getConnection(function(err, conn) {

    conn.query({
      sql: 'INSERT INTO payments (dateDue, isPaid, amount, description, propertyId, type) ' +
           'VALUES (?,?,?,?,?,?)',
      values: [dateDue, isPaid, amount, description, propertyId, type],
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);
      return reply("Payment added");
    });
  });
}



module.exports = payments;
