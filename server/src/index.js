const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { statements, sanitizeInput } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes

// GET /api/players - Fetch player profile
app.get('/api/players', (req, res) => {
  try {
    const players = statements.getPlayers.all();
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

// POST /api/players - Create or update player profile
app.post('/api/players', (req, res) => {
  try {
    const { name, handicapIndex, startHandicap, birthDate } = req.body;

    if (!name || handicapIndex === undefined || startHandicap === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, handicapIndex, startHandicap'
      });
    }

    // Sanitize name
    const sanitizedName = sanitizeInput(name);

    // Save player
    statements.createPlayer.run(
      sanitizedName,
      parseFloat(handicapIndex),
      parseFloat(startHandicap),
      birthDate || null
    );

    const player = statements.getPlayerByName.get(sanitizedName);

    res.status(201).json({
      success: true,
      data: {
        id: player.id,
        name: player.name,
        handicapIndex: player.handicap_index,
        startHandicap: player.start_handicap,
        birthDate: player.birth_date,
        createdAt: player.created_at,
        updatedAt: player.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating/updating player:', error);
    res.status(500).json({ success: false, error: 'Failed to create/update player' });
  }
});

// PUT /api/players/:name - Update player profile
app.put('/api/players/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { handicapIndex, startHandicap, birthDate } = req.body;

    const existing = statements.getPlayerByName.get(name);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    // Sanitize name
    const sanitizedName = sanitizeInput(name);

    statements.updatePlayer.run(
      parseFloat(handicapIndex),
      parseFloat(startHandicap),
      birthDate || null,
      sanitizedName
    );

    const player = statements.getPlayerByName.get(sanitizedName);

    res.json({
      success: true,
      data: {
        id: player.id,
        name: player.name,
        handicapIndex: player.handicap_index,
        startHandicap: player.start_handicap,
        birthDate: player.birth_date,
        createdAt: player.created_at,
        updatedAt: player.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ success: false, error: 'Failed to update player' });
  }
});

// GET /api/rounds - Fetch all rounds (with optional type filter)
app.get('/api/rounds', (req, res) => {
  try {
    const { type } = req.query;

    let rounds;
    if (type && (type === 'official' || type === 'training')) {
      rounds = statements.getRoundsByType.all(type);
    } else {
      rounds = statements.getAllRounds.all();
    }

    // Convert to frontend format
    const formattedRounds = rounds.map(round => ({
      id: round.id,
      date: round.date,
      courseName: round.course_name,
      courseRating: round.course_rating,
      slopeRating: round.slope_rating,
      score: round.score,
      par: round.par,
      holes: round.holes,
      roundType: round.round_type,
      differentialScore: round.differential_score,
      notes: round.notes
    }));

    res.json({ success: true, data: formattedRounds });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rounds' });
  }
});

// GET /api/rounds/:id - Fetch single round
app.get('/api/rounds/:id', (req, res) => {
  try {
    const round = statements.getRoundById.get(req.params.id);

    if (!round) {
      return res.status(404).json({ success: false, error: 'Round not found' });
    }

    res.json({
      success: true,
      data: {
        id: round.id,
        date: round.date,
        courseName: round.course_name,
        courseRating: round.course_rating,
        slopeRating: round.slope_rating,
        score: round.score,
        par: round.par,
        holes: round.holes,
        roundType: round.round_type,
        differentialScore: round.differential_score,
        notes: round.notes
      }
    });
  } catch (error) {
    console.error('Error fetching round:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch round' });
  }
});

// POST /api/rounds - Create new round
app.post('/api/rounds', (req, res) => {
  try {
    const {
      id,
      date,
      courseName,
      courseRating,
      slopeRating,
      score,
      par,
      holes = '18',
      roundType = 'official',
      notes = null
    } = req.body;

    // Validation
    if (!id || !date || !courseName || !courseRating || !slopeRating || !score || !par) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!['official', 'training'].includes(roundType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid round type. Must be "official" or "training"'
      });
    }

    if (!['9', '18'].includes(holes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid holes. Must be "9" or "18"'
      });
    }

    // Sanitize text fields (notes can have user content)
    if (notes) {
      notes = sanitizeInput(notes);
    }

    // Calculate differential
    let differential = (113 / slopeRating) * (score - courseRating);
    
    // For 9-hole rounds, convert to 18-hole differential using WHS formula
    if (holes === '9') {
      // Get player's current handicap index for expected score calculation
      const players = statements.getPlayers.all();
      const player = players.length > 0 ? players[0] : null;
      
      if (player && player.handicap_index) {
        // Official WHS: Expected 9-hole Score = (0.52 × Handicap_Index) + 1.2
        // Since we're calculating differential, we use: Expected 9-hole Differential = 0.52 × Handicap_Index + 1.2
        const expected9HoleDifferential = (0.52 * player.handicap_index) + 1.2;
        differential = differential + expected9HoleDifferential;
      } else {
        // Fallback: double the differential if no player profile exists
        differential *= 2;
      }
    }
    
    const roundedDifferential = Math.round(differential * 10) / 10;

    // Save round
    statements.createRound.run(
      id,
      date,
      courseName,
      courseRating,
      slopeRating,
      score,
      par,
      holes,
      roundType,
      roundedDifferential,
      notes
    );

    res.status(201).json({
      success: true,
      data: {
        id,
        date,
        courseName,
        courseRating,
        slopeRating,
        score,
        par,
        holes,
        roundType,
        differentialScore: roundedDifferential,
        notes
      }
    });
  } catch (error) {
    console.error('Error creating round:', error);
    res.status(500).json({ success: false, error: 'Failed to create round' });
  }
});

// PUT /api/rounds/:id - Update round
app.put('/api/rounds/:id', (req, res) => {
  try {
    const {
      date,
      courseName,
      courseRating,
      slopeRating,
      score,
      par,
      holes = '18',
      roundType = 'official',
      notes = null
    } = req.body;

    // Check if round exists
    const existing = statements.getRoundById.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Round not found' });
    }

    // Sanitize text fields (notes can have user content)
    if (notes) {
      notes = sanitizeInput(notes);
    }

    // Calculate differential
    let differential = (113 / slopeRating) * (score - courseRating);
    
    // For 9-hole rounds, convert to 18-hole differential using WHS formula
    if (holes === '9') {
      // Get player's current handicap index for expected score calculation
      const players = statements.getPlayers.all();
      const player = players.length > 0 ? players[0] : null;
      
      if (player && player.handicap_index) {
        // Official WHS: Expected 9-hole Score = (0.52 × Handicap_Index) + 1.2
        // Since we're calculating differential, we use: Expected 9-hole Differential = 0.52 × Handicap_Index + 1.2
        const expected9HoleDifferential = (0.52 * player.handicap_index) + 1.2;
        differential = differential + expected9HoleDifferential;
      } else {
        // Fallback: double the differential if no player profile exists
        differential *= 2;
      }
    }
    
    const roundedDifferential = Math.round(differential * 10) / 10;

    // Update round
    statements.updateRound.run(
      date,
      courseName,
      courseRating,
      slopeRating,
      score,
      par,
      holes,
      roundType,
      roundedDifferential,
      notes,
      req.params.id
    );

    res.json({
      success: true,
      data: {
        id: req.params.id,
        date,
        courseName,
        courseRating,
        slopeRating,
        score,
        par,
        holes,
        roundType,
        differentialScore: roundedDifferential,
        notes
      }
    });
  } catch (error) {
    console.error('Error updating round:', error);
    res.status(500).json({ success: false, error: 'Failed to update round' });
  }
});

// DELETE /api/rounds/:id - Delete round
app.delete('/api/rounds/:id', (req, res) => {
  try {
    const result = statements.deleteRound.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Round not found' });
    }

    res.json({ success: true, message: 'Round deleted successfully' });
  } catch (error) {
    console.error('Error deleting round:', error);
    res.status(500).json({ success: false, error: 'Failed to delete round' });
  }
});

// GET /api/statistics - Fetch statistics
app.get('/api/statistics', (req, res) => {
  try {
    const stats = statements.getStatistics.all();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Golf Handicap Tracker API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 API endpoint: http://localhost:${PORT}/api/rounds`);
});
