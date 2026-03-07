const { db: sqliteDb, statements: sqliteStatements } = require('./sqlite');
const { db: pgDb, statements: pgStatements } = require('./postgres');

// DB Type: 'sqlite' or 'postgres'
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// Load appropriate database module
let db, statements;

if (DB_TYPE === 'postgres') {
  const { db: pgDb, statements: pgStatements } = require('./postgres');
  db = pgDb;
  statements = pgStatements;
} else {
  const { db: sqliteDb, statements: sqliteStatements } = require('./sqlite');
  db = sqliteDb;
  statements = sqliteStatements;
}

module.exports = { db, statements };
