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
      validate: {
        payload: {
          username: Joi.string().alphanum().min(3).max(30),
          password: Joi.string().regex(/[a-zA-Z0-9]{5,100}/),
        }
      }
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
          password: Joi.string().regex(/[a-zA-Z0-9]{5,100}/),
          firstName: Joi.string().alphanum().max(100),
          lastName: Joi.string().alphanum().max(100),
          phone: Joi.string().alphanum().min(8).max(10),
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
        params: { userId: Joi.number().integer() },
        payload: {
          request: Joi.string().max(2048),
          priority: Joi.string().valid(['Urgent', 'Can Wait', 'Information']),
          image: Joi.string(),
        }
      }
    }
  },
  {
    path: '/users/{userId}/repairs/{requestId}/images',
    method: 'POST',
    config: {
      handler: require('./handlers/userRepairImages.js'),
      auth: 'session',
      validate: {
        params: { 
          userId: Joi.number().integer(),
          requestId: Joi.number().integer(),
        },
        payload: {
          image: Joi.string(),
          requestId: Joi.number().integer(),
        },
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
        },
        payload: {
          tenantEmail: Joi.string().email().max(255).allow(['', null]),
          leaseExpiry: Joi.date().iso().allow(['', null]),
          ownerEmail: Joi.string().email().max(255),
          streetAddress: Joi.string().min(1).max(500),
          suburb: Joi.string().min(1).max(500),
          postCode: Joi.string().min(4).max(4),
          dataUrl: Joi.string(),
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
    method: 'POST',
    path: '/properties/{propertyId}/details',
    config: {
      handler: require('./handlers/propertyDetails.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() },
        payload: {
          propertyId: Joi.number().integer().required(),
          tenantEmail: Joi.string().email().max(255).allow(['', null]),
          leaseExpiry: Joi.date().iso().allow(['', null]),
          ownerEmail: Joi.string().email().max(255),
          street: Joi.string().min(1).max(500),
          suburb: Joi.string().min(1).max(500),
          postcode: Joi.string().min(4).max(4),
          photo: Joi.string(),
        }
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
          propertyId: Joi.number().integer().required(),
          requestId: Joi.number().integer().required(),
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
  },
  {
    method: 'POST',
    path: '/properties/{propertyId}/calendarEvents',
    config: {
      handler: require('./handlers/propertyCalendarEvents.js'),
      auth: 'session',
      validate: {
        payload: {
          eventDesc: Joi.string().max(64).required(),
          date: Joi.date(),
          // date: Joi.date().format('DD/MM/YYYY'),
          // time: Joi.date().format('h:mm a'),
          notes: Joi.string().max(1000).allow(''),
          propertyId: Joi.number().integer()
        },
      }
    }
  },
  {
    // Gets the contacts for a given property for the currently authed user.
    // Contacts are other users the user can liase with (eg for a agent this
    // will include both the tenant and owner of the property).
    method: 'GET',
    path: '/properties/{propertyId}/contacts',
    config: {
      handler: require('./handlers/propertyContacts.js'),
      auth: 'session',
      validate: {
        params: { propertyId: Joi.number().integer() },
      }
    }
  },


  // ---------------------------------------------------------------------------
  // Messages Resource Routes
  // ---------------------------------------------------------------------------
  {
    // Returns the 20 most recent messages exchanged between the authenticated
    // user from and the user specified by the partnerId.
    method: 'GET',
    path: '/messages',
    config: {
      handler: require('./handlers/messages.js'),
      auth: 'session',
      validate: {
        query: {
          partnerId: Joi.number().integer().positive(),
          count: Joi.number().integer().positive().default(20),
          offset: Joi.number().integer().positive().default(0),
        }
      }
    }
  },
  {
    // Sends a new message from the authenticated user to the receiverId
    method: 'POST',
    path: '/messages',
    config: {
      handler: require('./handlers/messages.js'),
      auth: 'session',
      validate: {
        payload: {
          receiverId: Joi.number().integer().positive(),
          message: Joi.string(),
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Events Routes
  // ---------------------------------------------------------------------------
  {
    // Returns all events for a given agent and their managing properties
    method: 'GET',
    path: '/events',
    config: {
      handler: require('./handlers/events.js'),
      auth: 'session',
      validate: {
        query: {
          agentId: Joi.number().integer().positive(),
        }
      }
    }
  },
  {
    // Updates an event with a given eventId
    method: 'PUT',
    path: '/events/{eventId}',
    config: {
      handler: require('./handlers/events.js'),
      auth: 'session',
      validate: {
        params: {
          eventId: Joi.number().integer().positive(),
        },
        payload: {
          id: Joi.number().integer().positive(),
          date: Joi.date(),
          event: Joi.string().max(64).required(),
          notes: Joi.string().max(1000).allow(['', null]),
          propertyId: Joi.number().integer().positive(),
        }
      }
    }
  },
  {
    // Deletes an event with a given eventId
    method: 'DELETE',
    path: '/events/{eventId}',
    config: {
      handler: require('./handlers/events.js'),
      auth: 'session',
      validate: {
        params: {
          eventId: Joi.number().integer().positive(),
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Repair Request Routes
  // ---------------------------------------------------------------------------
  {
    // Returns repair requests for properties managed by the specified
    // agent.
    method: 'GET',
    path: '/repairRequests',
    config: {
      handler: require('./handlers/repairRequests.js'),
      auth: 'session',
      validate: {
        query: {
          agentId: Joi.number().integer().positive(),
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/repairRequests/{repairRequestId}',
    config: {
      handler: require('./handlers/repairRequest.js'),
      auth: 'session',
      validate: {
        params: {
          repairRequestId: Joi.number().integer().positive(),
        },
        payload: {
          id: Joi.number().integer().positive(),
          date: Joi.date(),
          request: Joi.string().max(2048),
          photo: Joi.string(),
          status: Joi.string().valid(['Submitted', 'Pending', 'Approved', 'Declined']),
          tenantId: Joi.number().integer().positive(),
          propertyId: Joi.number().integer().positive(),
          priority: Joi.string().valid(['Urgent', 'Can Wait', 'Information']),
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Payments Routes
  // ---------------------------------------------------------------------------
  {
    // Returns repair requests for properties managed by the specified
    // agent.
    method: 'GET',
    path: '/payments',
    config: {
      handler: require('./handlers/payments.js'),
      auth: 'session',
      validate: {
        query: {
          propertyId: Joi.number().integer().positive().allow(null),
          overdue: Joi.boolean().allow(null),
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/payments',
    config: {
      handler: require('./handlers/payments.js'),
      auth: 'session',
      validate: {
        payload: {
          dateDue: Joi.date(),
          amount: Joi.number(),
          description: Joi.string().max(256),
          propertyId: Joi.number().integer().positive(),
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/payments/{paymentId}',
    config: {
      handler: require('./handlers/payment.js'),
      auth: 'session',
      validate: {
        params: {
          paymentId: Joi.number().integer().positive(),
        },
        payload: {
          isPaid: Joi.boolean()
        }
      }
    }
  },

]);

server.start(function() {
  console.log('server running at: ' + server.info.uri);
});
