const { default: rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis')
// 1. Initialize and connect the Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
  
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error('Unable to connect to Redis. Start Redis or set REDIS_URL.', err);
  }
})();

const  productGetLimiter = rateLimit({
  windowMs: 14000, // 15 minutes
  max: 5, // limit each IP to 30 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for admin users if needed
    return false;
  },
  // Tell the framework to store counts in Redis instead of local memory
  store: new RedisStore({
    sendCommand: (...args) => {
        console.log('Redis command:', args);
        return redisClient.sendCommand(args);
    },
  }),
   // Custom behavior when an IP hits the limit
  handler: (req, res, next, options) => {
    console.warn(`[ALERT] High traffic node detected! IP: ${req.ip} exceeded ${options.max} requests/min.`);
    
    // Send a 429 Too Many Requests status code
    res.status(429).send({
      error: 'Too many requests. Please slow down.',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000)
    });
  },
});

const userGetLimiter = rateLimit({
  windowMs: 15000, // 15 minutes
  max: 5, // limit each IP to 30 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for admin users if needed
    return false;
  },
  handler: (req, res, next, options) => {
    console.warn(`[BLOCKED] IP ${req.ip} exceeded the request limit.`);
    res.status(options.statusCode).send(options.message);
  }
});

module.exports ={
    productGetLimiter,
    userGetLimiter
}