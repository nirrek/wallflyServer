function userUpdate(request, reply) {
  // TODO figure out if there is middleware for parsing this into a data js obj
  var userId = parseInt(request.params.userId, 10);

  var name = request.payload.name

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  connection.query({
    sql: 'UPDATE `users` SET name = ? where id = ?',
    values: [name, userId],
  }, function(error, results) {
    if (error) return reply('error');

    return reply('successfully updated ' + name);
  });
}

module.exports = userUpdate;
