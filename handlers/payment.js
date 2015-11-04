/**
 * Handlers for the payment resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function payment(request, reply) {
  if      (request.method === 'put')  putHandler(request, reply);
}

/**
 * PUT handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 */
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
