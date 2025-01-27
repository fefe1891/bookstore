const { Pool } = require('pg');

// Use the same connection string that you're using in your application
const connectionString = `postgresql://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@localhost:5432/bookstore_test`;

const pool = new Pool({
  connectionString,
});

pool.connect()
  .then((client) => {
    console.log('Connected to the database successfully');
    return client.release();
  })
  .then(() => {
    pool.end();
    console.log('Disconnected from the database');
  })
  .catch((err) => {
    console.error('Failed to connect to the database:');
    console.error(err);
  });