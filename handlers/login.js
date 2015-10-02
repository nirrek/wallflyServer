var validate = require('../validation.js').validate;

function loginHandler(request, reply) {
  var username = request.payload.username;
  var password = request.payload.password;
  var message = '';

  // Handle missing credentials
  if (!username || !password) {
    message = 'Missing username or password';
    return reply(message).code(401);
  }

  // Fetch user the user model from the database
  // var account = users[username];
  validate(request, username, password, function(err, isValid, user) {
    if (!isValid) return reply('Invalid username or password');

    // Add the users id only to the session. The session data is passed around
    // as base64 ecnoded data in the cookie. Importantly, if the encoding is
    // too large, the browser will drop the cookie on the floor. This leads to
    // very confusing bugs.
    request.auth.session.set({
      id: user.id
    });

    return reply(user);
  });
}

module.exports = loginHandler
