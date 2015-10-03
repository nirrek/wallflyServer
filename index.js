var Hapi = require('hapi');
var Good = require('good');
var Basic = require('hapi-auth-basic');
var database = require('./database.js');
var Joi = require('joi');
var config = require('./config.js');

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: { // Enable Cross-Origin-Resource-Sharing during dev.
        origin: ['*'], // Allow any origin to perform a CORS request
        credentials: true, // Access-Control-Allow-Credentials: true
      },
    }
  }
});
server.connection({
  host: config.host,
  port: config.port
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
          avatar: Joi.string(),
        },
        options: {
          abortEarly: false,    // find all validation errors, not just first.
          presence: 'required', // all properties required
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/{userId}',
    config: {
      handler: require('./handlers/userGet.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'PUT',
    path: '/users/{userId}',
    config: {
      handler: require('./handlers/userUpdate.js'),
      auth: 'session',
      validate: {
        params: { userId: Joi.number().integer() },
        payload: {
          username: Joi.string().alphanum().min(3).max(30),
          firstName: Joi.string().alphanum().max(100),
          lastName: Joi.string().alphanum().max(100),
          phone: Joi.string().alphanum().max(10),
          email: Joi.string().email(),
          avatar: Joi.string(),
        }
      }
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
    path: '/users/{userId}/payments',
    method: 'POST',
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
    path: '/users/{userId}/repairs',
    method: 'POST',
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
  },


  // ---------------------------------------------------------------------------
  // Property Resource Routes
  // ---------------------------------------------------------------------------
  {
    method: 'GET',
    path: '/properties',
    config: {
      handler: require('./handlers/properties.js'),
      auth: 'session',
      validate: {
        query: {
          userId: Joi.number().integer()
        }
      }
    }
  },
  {
    path: '/properties',
    method: 'POST',
    config: {
      handler: require('./handlers/properties.js'),
      auth: 'session',
      validate: {
        query: {
          userId: Joi.number().integer()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/properties/{propertyId}/details',
    config: {
      handler: require('./handlers/propertyDetails.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'GET',
    path: '/properties/{propertyId}/payments',
    config: {
      handler: require('./handlers/propertyPayments.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'GET',
    path: '/properties/{propertyId}/repairRequests',
    config: {
      handler: require('./handlers/propertyRepairRequests.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'PUT',
    path: '/properties/{propertyId}/repairRequests',
    config: {
      handler: require('./handlers/propertyRepairRequests.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() },
        payload: {
          repairStatus: Joi.string().valid(['Submitted', 'Pending', 'Approved', 'Declined']),
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/properties/{propertyId}/inspectionReports',
    config: {
      handler: require('./handlers/propertyInspectionReports.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'POST',
    path: '/properties/{propertyId}/inspectionReports',
    config: {
      handler: require('./handlers/propertyInspectionReports.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  },
  {
    method: 'GET',
    path: '/properties/{propertyId}/calendarEvents',
    config: {
      handler: require('./handlers/propertyCalendarEvents.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() }
      }
    }
  }
]);

server.start(function() {
  console.log('server running at: ' + server.info.uri);
});
