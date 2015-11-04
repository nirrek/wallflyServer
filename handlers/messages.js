/**
 * Handlers for the messages resource.
 */
var database = require('../database.js');
var pool = database.getConnectionPool();

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function messages(request, reply) {
  var userId = request.auth.artifacts.id;

  if      (request.method === 'get')  getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}

/**
 * GET handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 * @param {Number} userId  The userId of the request initiator.
 */
function getHandler(request, reply, userId) {
  var partnerId = request.query.partnerId; // conversation partner of the user.
  var count = request.query.count;
  var offset = request.query.offset;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'SELECT DISTINCT m.id as id, timestamp, message, ' +
           'u1.id as partnerId, u1.avatar as senderAvatar, ' +
           'u2.id as receiverId, u2.avatar as receiverAvatar ' +
           'FROM messages m, users u1, users u2 ' +
           'WHERE ((receiver = ? AND sender = ?) OR (receiver = ? AND sender = ?)) ' +
           'AND m.sender = u1.id AND m.receiver = u2.id ' +
           'ORDER BY timestamp DESC ' +
           'LIMIT ?,?',
      values: [userId, partnerId, partnerId, userId, offset, count],
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);

      // Note that we want the order to be oldest-to-youngest on the client
      // but we need to sql query to be the opposite, so we reverse the results.
      var messages = results.reverse().map(function(row) {
        return {
          id: row.id,
          timestamp: row.timestamp,
          message: row.message,
          sender: {
            id: row.partnerId,
            avatar: row.senderAvatar,
          },
          receiver: {
            id: row.receiverId,
            avatar: row.receiverAvatar,
          },
        };
      });

      return reply(messages);
    });
  });
}

/**
 * POST handler
 * @param {Object} request Hapi request object.
 * @param {Object} reply   Hapi reply object.
 * @param {Number} userId  The userId of the request initiator.
 */
function postHandler(request, reply, userId) {
  var receiverId = request.payload.receiverId;
  var message = request.payload.message;

  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'INSERT INTO messages (message, sender, receiver) ' +
           'VALUES(?,?,?)',
      values: [message, userId, receiverId],
    }, function(err, results) {
      conn.release();
      if (err) return reply(err.toString()).code(500);
      return reply("Message sent");
    });
  });
}



module.exports = messages;
