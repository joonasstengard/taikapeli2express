import mysql from 'mysql2';

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost', // your host, e.g., 'localhost'
  user: 'root', // db user
  password: 'kissataulu', // db password
  database: 'taikapeli_db' // db name
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default connection;
