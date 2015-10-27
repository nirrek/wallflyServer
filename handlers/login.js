var validate = require('../validation.js').validate;
var database = require('../database.js');
var pool = database.getConnectionPool();

function loginHandler(request, reply) {
  var username = request.payload.username;
  var password = request.payload.password;

  validate(request, username, password, function(err, isValid, user) {
    if (!isValid) return reply('Invalid username or password.').code(422);

    // Add the users id only to the session. The session data is passed around
    // as base64 ecnoded data in the cookie. Importantly, if the encoding is
    // too large, the browser will drop the cookie on the floor. This leads to
    // very confusing bugs.
    request.auth.session.set({
      id: user.id,
      type: user.type,
    });

    if (user.isFirstLogin) {
      updateFirstLogin(user.id);
    }

    return reply(user);
  });
}

// Updates the given users first login status to false.
function updateFirstLogin(userId) {
  pool.getConnection(function(err, conn) {
    conn.query({
      sql: 'UPDATE users ' +
           'SET isFirstLogin=0 ' +
           'WHERE id=?',
      values: [userId],
    }, function(err, results) {
      conn.release();
      if (err) console.log(err);
    });
  });
}

module.exports = loginHandler
