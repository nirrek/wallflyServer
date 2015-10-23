var database = require('../database.js');
var pool = database.getConnectionPool();

function events(request, reply) {

  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'put') putHandler(request, reply);
  else if (request.method === 'delete') deleteHandler(request, reply);
}

function getHandler(request, reply) {
  var agentId = request.query.agentId;

  if (agentId !== request.auth.artifacts.id) {
    return reply('Not authorized').code(401);
  }

  pool.getConnection(function(err, connection) {
    connection.query({
      sql:
        'SELECT e.id, e.date, e.event, e.notes, e.propertyId, p.street, p.suburb ' +
        'FROM events e JOIN properties p ON e.propertyId = p.id ' +
        'WHERE propertyId IN (SELECT id FROM properties WHERE agentId=?) ' +
        'ORDER BY date ASC',
      values: [agentId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in events.js (get)', err);
        return reply('Error').code(500);
      }

      if (results.length === 0) {
        console.log('No result for this user = ' + userId)
      }
      reply(results);
    });
  });
}

function putHandler(request, reply) {
  var payload = request.payload;
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'UPDATE events ' +
           'SET date = ?, ' +
           'event = ?, ' +
           'notes = ?, ' +
           'propertyId = ? ' +
           'WHERE id = ?',
      values: [
        payload.date,
        payload.event,
        payload.notes,
        payload.propertyId,
        payload.id
      ],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in events.js (put)', err);
        return reply('Error').code(500);
      }
      reply(results);
    });
  });
}

function deleteHandler(request, reply) {

  pool.getConnection(function(err, connection) {
    connection.query({
      sql:
        'DELETE FROM events ' +
        'WHERE id = ?',
      values: [request.params.eventId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log('Error in events.js (post)', err);
        return reply('Error').code(500);
      }
      reply(results);
    });
  });
}



module.exports = events;
