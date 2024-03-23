import mysql from 'mysql2';

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost', // your host, e.g., 'localhost'
  user: 'root', // your database user
  password: 'kissataulu', // your database password
  database: 'taikapeli_db' // your database name
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default connection;
