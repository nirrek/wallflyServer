/**
 * Handlers for properties resource.
 */
var config = require('../config.js');
var database = require('../database.js');
var pool = database.getConnectionPool();
var getPhotoUrl = require('../utils.js').getPhotoUrl;

/**
 * Route the request based upon the HTTP method type.
 * @param  {Object} request Hapi request object.
 * @param  {Object} reply   Hapi reply object.
 */
function properties(request, reply) {
  var userId = request.query.userId;

  if (request.auth.artifacts.id !== userId) {
    return reply('You arent allowed to do this').code(401);
  }

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
  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT * ' +
           'FROM properties p ' +
           'WHERE p.agentId = ? OR p.ownerId = ?',
      values: [userId, userId],
    }, function(err, results) {
      connection.release();
      if (err) return reply(err);

      reply(results);
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
  var payload = request.payload;

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT id FROM users WHERE email = ? AND userType = 3',
      values: [payload.ownerEmail]
    }, function(err, results) {
      if (err) {
        connection.release();
        return reply(err).code(500);
      } else if (!results[0]) {
        connection.release();
        var error = new Error('No owner with email: ' + payload.ownerEmail);
        return reply(error.toString()).code(500);
      }
      var ownerUser = results[0].id;

      if (payload.tenantEmail != '') {
        connection.query({
          sql: 'SELECT id FROM users WHERE email = ? AND userType = 1',
          values: [payload.tenantEmail]
        }, function(err, results) {
          if (err) {
            connection.release();
            return reply(err).code(500);
          } else if (!results[0]) {
            connection.release();
            var error = new Error('No tenant with email: ' + payload.tenantEmail);
            return reply(error.toString()).code(500);
          }
          var tenantUser = results[0].id;

          connection.query({
            sql: 'INSERT INTO properties ' +
                 '(agentId, ownerId, postcode, street, suburb, tenantId, photo, leaseExpiry) ' +
                 'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            values:[
              userId,
              ownerUser,
              payload.postCode,
              payload.streetAddress,
              payload.suburb,
              tenantUser,
              payload.dataUrl,
              payload.leaseExpiry,
            ],
          }, function(err, results) {
            if (err) {
              connection.release();
              reply(err.toString()).code(500);
              return;
            }

            if (payload.leaseExpiry) {
              addLeaseExpiryEvent(connection, payload.leaseExpiry);
            }
            reply('Property added successfully');
          });
        });
      }

      else {
        connection.query({
          sql: 'INSERT INTO properties ' +
               '(agentId, ownerId, postcode, street, suburb, tenantId, photo, leaseExpiry) ' +
               'VALUES (?, ?, ?, ?, ?, NULL, ?, ?)',
          values:[
            userId,
            ownerUser,
            payload.postCode,
            payload.streetAddress,
            payload.suburb,
            payload.dataUrl,
            payload.leaseExpiry,
          ],
        }, function(err, results) {
          if (err) {
            connection.release();
            reply(err.toString()).code(500);
            return;
          }

          if (payload.leaseExpiry) {
            addLeaseExpiryEvent(connection, payload.leaseExpiry);
          }
          reply('Property added successfully');
        });
      }
    });
  });
}

/**
 * Adds a new leaseExpiry event.
 * @param {Object} conn        Database connection.
 * @param {Date}   leaseExpiry The date the lease expires.
 */
function addLeaseExpiryEvent(conn, leaseExpiry) {
  // Retrieve the propertyId from the just added property
  conn.query({
    sql: 'SELECT LAST_INSERT_ID() as propertyId'
  }, function(err, results) {
    if (err) {
      conn.release();
      return console.log(err);
    }

    var propertyId = results[0].propertyId;

    // Fetch the property address
    conn.query({
      sql: 'SELECT street FROM properties WHERE id = ?',
      values: [propertyId]
    }, function(err, results) {
      if (err) {
        conn.release();
        return console.log(err);
      }

      // Insert a new lease expiry event for the property.
      conn.query({
        sql: 'INSERT INTO events (date, event, propertyId) ' +
             'VALUES (?, ?, ?)',
        values: [
          leaseExpiry,
          'Lease expires ' + results[0].street,
          propertyId,
        ],
      }, function(err, results) {
        conn.release();
        if (err) console.log(err);
      });
    });
  });
}

module.exports = properties;
