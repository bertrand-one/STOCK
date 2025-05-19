const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    // Connect without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS stock_management');
    console.log('Database created or already exists');
    
    // Close the connection
    await connection.end();
    
    console.log('You can now run the server with: node server.js');
    
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

createDatabase();
