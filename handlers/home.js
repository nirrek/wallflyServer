var homeHandler = function(request, reply) {
  reply.file('index.html');
}

module.exports = homeHandler;
