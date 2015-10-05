var getPhotoUrl = require('../utils.js').getPhotoUrl;
var database = require('../database.js');
var pool = database.getConnectionPool();

function propertyDetails(request, reply) {
  if      (request.method === 'get')  getHandler(request, reply);
  else if (request.method === 'post') postHandler(request, reply);
}


// -----------------------------------------------------------------------------
//  GET Handler
// -----------------------------------------------------------------------------
function getHandler(request, reply) {
  var propertyId = request.params.propertyId;

  // TODO add access control. Currently any authed user can fetch the details
  // of any property, not just one they are associated with.

  pool.getConnection(function(err, connection) {
    connection.query({
      sql: 'SELECT p.id, street, suburb, postcode, photo, tenantId, agentId ownerId, '+
           't.email as tenantEmail, o.email as ownerEmail ' +
           'FROM properties p ' +
           'LEFT JOIN users t ON p.tenantId = t.id ' +
           'JOIN users o ON p.ownerId = o.id ' +
           'WHERE p.id = ?',
      values: [propertyId],
    }, function(err, results) {
      connection.release();
      if (err) {
        console.log(err);
        return reply(err.toString()).code(500);
      }

      var result = results[0];
      if (!result) console.log('No result for propertyId = ' + propertyId);
      reply(result);
    });
  });
}


// -----------------------------------------------------------------------------
// POST Handler
// -----------------------------------------------------------------------------
function postHandler(request, reply) {
  var payload = request.payload;

  pool.getConnection(function(err, conn) {
    var tenantEmail = payload.tenantEmail;
    var ownerEmail = payload.ownerEmail;
    var street = payload.street;
    var suburb = payload.suburb;
    var postcode = payload.postcode;
    var propertyId = payload.propertyId;
    var photo = payload.photo;


    getUserByEmail({
      connection: conn,
      email: ownerEmail,
      userType: 3,
    }, function(err, conn, data) {
      if (err) {
        conn.release();
        console.error(err);
        return reply(err.toString()).code(500);
      }

      ownerId = data.user.id;

      // If a new tenantEmail was provided, fetch the tenant's user model first.
      if (tenantEmail) {
        getUserByEmail({
          connection: conn,
          email: tenantEmail,
          userType: 1,
        }, function(err, conn, data) {
          if (err) {
            conn.release();
            console.error(err);
            return reply(err.toString()).code(500);
          }

          updatePropertyDetails({
            connection: conn,
            reply: reply,
            id: propertyId,
            tenantId: data.user.id,
            ownerId: ownerId,
            street: street,
            suburb: suburb,
            postcode: postcode,
            photo: photo,
          });
        });
        return;
      }

      updatePropertyDetails({
        connection: conn,
        reply: reply,
        id: propertyId,
        tenantId: null,
        ownerId: ownerId,
        street: street,
        suburb: suburb,
        postcode: postcode,
        photo: photo,
      });
    });
    return;
  });
}


/**
 * Fetches a user by the provided email.
 * @param  {Object}   options  Must provide a connection property for the
 *                             current database connection.
 * @param  {Function} callback Signature is (err, conn, data), conn is the
 *                             db connection to allow chaining queries.
 */
function getUserByEmail(options, callback) {
  var email = options.email;
  var conn = options.connection;
  var type = options.userType

  conn.query({
    sql: 'SELECT id FROM users WHERE email = ? AND userType = ?',
    values: [email,
      type]
  }, function(err, results) {
    var user = results[0];

    if (err) { // DB error
      callback(err, conn, null);
    } else if (!user) { // No user found
      var error = new Error('No user with email: ' + email);
      callback(error, conn, null);
    } else {
      var data = { user: user };
      callback(null, conn, data);
    }
  });
}

/**
 * Update the given property with the given details and then closes the
 * database connection. All the details are specified in the options object.
 * @param  {Object} options Must include a `connection` prop for the db conn
 *                          and a `reply` prop the hapi reply function.
 */
function updatePropertyDetails(options) {
  var conn = options.connection;
  var reply = options.reply;

  conn.query({
    sql: 'UPDATE properties ' +
         'SET tenantId = ?, ' +
         'ownerId = ?, ' +
         'street = ?, ' +
         'suburb = ?, ' +
         'postcode = ?, ' +
         'photo = ? ' +
         'WHERE id = ?',
    values: [
      options.tenantId,
      options.ownerId,
      options.street,
      options.suburb,
      options.postcode,
      options.photo,
      options.id,
    ],
  }, function(err, results) {
    conn.release();
    if (err) {
      console.log('Error updating property details', err);
      return reply(err.toString()).code(500);
    }

    reply('Property updated successfully');
  });
}

module.exports = propertyDetails;
