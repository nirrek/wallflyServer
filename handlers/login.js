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

    // Set the user model as the session artificat `request.auth.artifacts`
    request.auth.session.set(user);

    return reply(user);
  });
}

module.exports = loginHandler
