var database = require('../database.js');
var pool = database.getConnectionPool();

function payments(request, reply) {
  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);
}

function getHandler(request, reply) {
  var propertyId = request.query.propertyId;
  var overdue = request.query.overdue;
  var userType = request.auth.artifacts.type;
  var userId = request.auth.artifacts.id;

  pool.getConnection(function(err, conn) {
    var query;

    if (propertyId) {
      query = {
        sql: 'SELECT * ' +
             'FROM payments ' +
             'WHERE propertyId = ?',
        values: [propertyId],
      };
    } else { // If no propertyId fetch all payments for properties managed by the user
      query = {
        sql: 'SELECT y.id, y.dateAdded, y.dateDue, y.isPaid, y.amount, y.description, p.street, p.suburb ' +
             'FROM payments y, properties p ' +
             'WHERE y.propertyId = p.id ' +
             '  AND agentId = ?',
        values: [userId],
      };
    }

    if (overdue) { // add condition to only retrieve overdue payments
      query.sql += ' AND isPaid = 0 AND dateDue <= CURDATE()';
    }

    // Order from most recent to oldest.
    query.sql += ' ORDER BY dateDue DESC';

    conn.query(query, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);

      // Filter out agent/owner payments for the tenant user.
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
