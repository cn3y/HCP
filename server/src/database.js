const Database = require('better-sqlite3');
const path = require('path');

// Datenbank-Pfad (persistent im data-Verzeichnis)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/golf-handicap.db');

// Erstelle data-Verzeichnis falls nicht vorhanden
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialisiere Datenbank
const db = new Database(DB_PATH);

// Aktiviere WAL-Modus für bessere Performance
db.pragma('journal_mode = WAL');

// Erstelle Tabellen
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      course_name TEXT NOT NULL,
      course_rating REAL NOT NULL,
      slope_rating INTEGER NOT NULL,
      score INTEGER NOT NULL,
      par INTEGER NOT NULL,
      round_type TEXT NOT NULL CHECK(round_type IN ('official', 'training')),
      differential_score REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(date);
    CREATE INDEX IF NOT EXISTS idx_rounds_type ON rounds(round_type);
    CREATE INDEX IF NOT EXISTS idx_rounds_date_type ON rounds(date, round_type);
  `);

  console.log('Database initialized successfully');
}

// Prepared Statements für bessere Performance
const statements = {
  getAllRounds: db.prepare('SELECT * FROM rounds ORDER BY date DESC'),

  getRoundsByType: db.prepare('SELECT * FROM rounds WHERE round_type = ? ORDER BY date DESC'),

  getRoundById: db.prepare('SELECT * FROM rounds WHERE id = ?'),

  createRound: db.prepare(`
    INSERT INTO rounds (
      id, date, course_name, course_rating, slope_rating,
      score, par, round_type, differential_score, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  updateRound: db.prepare(`
    UPDATE rounds SET
      date = ?, course_name = ?, course_rating = ?, slope_rating = ?,
      score = ?, par = ?, round_type = ?, differential_score = ?,
      notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  deleteRound: db.prepare('DELETE FROM rounds WHERE id = ?'),

  getStatistics: db.prepare(`
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

module.exports = {
  db,
  initDatabase,
  statements
};
