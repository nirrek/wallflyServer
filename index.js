var Hapi = require('hapi');
var Good = require('good');
var Basic = require('hapi-auth-basic');
var database = require('./database.js');
var Joi = require('joi');

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: { // Enable Cross-Origin-Resource-Sharing during dev.
        origin: ['http://localhost:3000'],
        credentials: true, // allows user credentials to be sent to cross-origin clients
      },
    }
  }
});
server.connection({
  host: '0.0.0.0',
  port: 8000
});

// initialize the database connection pool
database.initialize();
var pool = database.getConnectionPool();

// Setup cookie authentication scheme.
server.register(require('hapi-auth-cookie'), function (err) {
    server.auth.strategy('session', 'cookie', {
        password: 'secret',
        cookie: 'sid',
        isSecure: false, // don't enforce https
    });
});

// Setup server routes
server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      handler: require('./handlers/home.js')
    }
  },
  {
    method: 'POST',
    path: '/login',
    config: {
      handler: require('./handlers/login.js'),
    }
  },
  {
    method: 'GET',
    path: '/logout',
    config: {
      handler: require('./handlers/logout.js'),
      auth: 'session',
    }
  },
  {
    method: 'POST',
    path: '/users',
    config: {
      handler: require('./handlers/userCreate.js'),
      validate: {
        payload: {
          username: Joi.string().alphanum().min(3).max(30),
          password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
          firstName: Joi.string().alphanum().max(100),
          lastName: Joi.string().alphanum().max(100),
          phone: Joi.string().alphanum().max(10),
          email: Joi.string().email(),
          userType: Joi.string().valid(['tenant', 'agent', 'owner']),
        },
        options: {
          abortEarly: false,    // find all validation errors, not just first.
          presence: 'required', // all properties required
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/users/{userId}',
    config: {
      handler: require('./handlers/userUpdate.js'),
      auth: 'session',
    }
  },
  {
    method: 'GET',
    path: '/users/{userId}/property',
    config: {
      handler: require('./handlers/userProperty.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    path: '/users/{userId}/payments',
    method: 'GET',
    config: {
      handler: require('./handlers/userPayments.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    path: '/users/{userId}/repairs',
    method: 'GET',
    config: {
      handler: require('./handlers/userRepairs.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    path: '/users/{userId}/inspections',
    method: 'GET',
    config: {
      handler: require('./handlers/userInspections.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    path: '/users/{userId}/events',
    method: 'GET',
    config: {
      handler: require('./handlers/userEvents.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    path: '/users/{userId}/messages',
    method: ['GET', 'POST'],
    config: {
      handler: require('./handlers/userMessages.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'GET',
    path: '/uploads/{path*}',
    handler: {
      directory: {
        path: './uploads',
        listing: false,
        index: false
      }
    }
  }
]);

server.start(function() {
  console.log('server running at: ' + server.info.uri);
});

