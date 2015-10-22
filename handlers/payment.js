var database = require('../database.js');
var pool = database.getConnectionPool();

function payment(request, reply) {
  if      (request.method === 'put')  putHandler(request, reply);
}

function putHandler(request, reply) {
  var paymentId = request.params.paymentId;
  var isPaid = request.payload.isPaid;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'UPDATE payments ' +
           'SET isPaid=? ' +
           'WHERE id=?',
      values: [isPaid, paymentId],
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);
      return reply("Payment updated");
    });
  });
}



module.exports = payment;
