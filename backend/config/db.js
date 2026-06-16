const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'rootpassword',
  database: process.env.DB_NAME || 'machinelink',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully to ' + (process.env.DB_HOST || 'localhost'));
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  query: (sql, params) => pool.query(sql, params)
};
