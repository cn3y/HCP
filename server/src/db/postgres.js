const { Client } = require('pg');
const sanitizeHtml = require('sanitize-html');

// PostgreSQL connection config
const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT) || 5432;
const PG_USER = process.env.PG_USER || 'golf';
const PG_PASSWORD = process.env.PG_PASSWORD || 'golf';
const PG_DATABASE = process.env.PG_DATABASE || 'golf_handicap';

// Initialize database connection
const db = new Client({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DATABASE,
});

// Connect on module load
db.connect()
  .then(() => {
    console.log('✅ Database connected successfully (PostgreSQL)');
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

// Create tables if not exist
const createTables = `
  CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    handicap_index REAL NOT NULL DEFAULT 28.0,
    start_handicap REAL NOT NULL DEFAULT 28.0,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_rating REAL NOT NULL,
    slope_rating INTEGER NOT NULL,
    score INTEGER NOT NULL,
    par INTEGER NOT NULL,
    holes TEXT NOT NULL CHECK(holes IN ('9', '18')),
    round_type TEXT NOT NULL CHECK(round_type IN ('official', 'training')),
    differential_score REAL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(date);
  CREATE INDEX IF NOT EXISTS idx_rounds_type ON rounds(round_type);
  CREATE INDEX IF NOT EXISTS idx_rounds_date_type ON rounds(date, round_type);
`;

db.query(createTables)
  .then(() => {
    console.log('✅ Database tables initialized successfully (PostgreSQL)');
  })
  .catch((err) => {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  });

// Prepared statements for better performance
const statements = {
  // Players
  getPlayers: db.query('SELECT * FROM players'),
  getPlayerByName: (name) => db.query('SELECT * FROM players WHERE name = $1', [name]),
  createPlayer: (name, handicapIndex, startHandicap, birthDate) => 
    db.query(`
      INSERT INTO players (name, handicap_index, start_handicap, birth_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(name) DO UPDATE SET
        handicap_index = EXCLUDED.handicap_index,
        start_handicap = EXCLUDED.start_handicap,
        birth_date = EXCLUDED.birth_date,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [name, parseFloat(handicapIndex), parseFloat(startHandicap), birthDate || null]),
  updatePlayer: (handicapIndex, startHandicap, birthDate, name) =>
    db.query(`
      UPDATE players SET
        handicap_index = $1, start_handicap = $2, birth_date = $3, updated_at = CURRENT_TIMESTAMP
      WHERE name = $4
      RETURNING *
    `, [parseFloat(handicapIndex), parseFloat(startHandicap), birthDate || null, name]),

  // Rounds
  getAllRounds: db.query('SELECT * FROM rounds ORDER BY date DESC'),
  getRoundsByType: (type) => db.query('SELECT * FROM rounds WHERE round_type = $1 ORDER BY date DESC', [type]),
  getRoundById: (id) => db.query('SELECT * FROM rounds WHERE id = $1', [id]),
  createRound: (id, date, courseName, courseRating, slopeRating, score, par, holes, roundType, differentialScore, notes) =>
    db.query(`
      INSERT INTO rounds (
        id, date, course_name, course_rating, slope_rating,
        score, par, holes, round_type, differential_score, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [id, date, courseName, parseFloat(courseRating), parseInt(slopeRating), parseInt(score), parseInt(par), holes, roundType, parseFloat(differentialScore), notes || null]),
  updateRound: (date, courseName, courseRating, slopeRating, score, par, holes, roundType, differentialScore, notes, id) =>
    db.query(`
      UPDATE rounds SET
        date = $1, course_name = $2, course_rating = $3, slope_rating = $4,
        score = $5, par = $6, holes = $7, round_type = $8, differential_score = $9,
        notes = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [date, courseName, parseFloat(courseRating), parseInt(slopeRating), parseInt(score), parseInt(par), holes, roundType, parseFloat(differentialScore), notes || null, id]),
  deleteRound: (id) => db.query('DELETE FROM rounds WHERE id = $1', [id]),

  // Statistics
  getStatistics: db.query(`
    SELECT
      round_type,
      COUNT(*) as total_rounds,
      AVG(score) as avg_score,
      MIN(score) as best_score,
      MAX(score) as worst_score,
      AVG(differential_score) as avg_differential
    FROM rounds
    GROUP BY round_type
  `)
};

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [],      // Strip all HTML tags
      allowedAttributes: {}, // Strip all attributes
      disallowedTagsMode: 'discard'
    });
  }
  return input;
}

// Close connection on exit
process.on('exit', () => {
  db.end();
});

process.on('SIGINT', () => {
  db.end().then(() => process.exit(0));
});

module.exports = {
  db,
  statements,
  sanitizeInput
};
