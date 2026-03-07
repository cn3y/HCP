// Database module loader
// Set DB_TYPE=postgres for PostgreSQL, default is SQLite

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

if (DB_TYPE === 'postgres') {
  module.exports = require('./db/postgres');
} else {
  module.exports = require('./db/sqlite');
}
