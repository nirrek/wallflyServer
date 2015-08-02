function logoutHandler(request, reply) {
  // clear session data, and tell client to clear session cookie
  request.auth.session.clear();
  return reply();
}

module.exports = logoutHandler;
