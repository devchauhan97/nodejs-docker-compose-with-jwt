// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool that supports Promises
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your app needs
  queueLimit: 0
});

// Export the promise-based pool
module.exports = pool.promise();
