/**
 * Handler for the homepage.
 */
var homeHandler = function(request, reply) {
  reply.file('index.html');
}

module.exports = homeHandler;
