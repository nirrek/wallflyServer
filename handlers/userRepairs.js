var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();

function userRepairs(request, reply) {
  var userId = request.params.userId;
  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this');
  }

  if      (request.method === 'get')  getHandler(request, reply, userId);
  else if (request.method === 'post') postHandler(request, reply, userId);
}

function getHandler(request, reply, userId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT date, subject, request, photo ' +
           'FROM repair_requests WHERE tenantId = ?',
      values: [userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      // Put the result set in a form for client consumption
      var massagedResults = results.map(function(row) {
        row.photo = config.urlRoot + row.photo; // set absolute URL for photo
        return row;
      });

      reply(massagedResults);
    });
  });
}

function postHandler(request, reply, userId) {
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'INSERT INTO repair_requests (date, subject, request, photo, tenantId, propertyId) ' +
           'VALUES (?, ?, ?, ?, ?, ?)',
      values:
      [request.payload.date,
      request.payload.subject,
      request.payload.description,
      request.payload.image,
      userId,
      3] //TODO: Work out propertyID from the user
      ,
    }, function(err, results) {
      connection.release();
      if (err) reply(err);

      reply('Repair Request added successfully');
    });
  });
}

module.exports = userRepairs;
