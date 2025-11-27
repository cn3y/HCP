require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { statements } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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

    // Calculate differential
    const differential = (113 / slopeRating) * (score - courseRating);
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
      roundType = 'official',
      notes = null
    } = req.body;

    // Check if round exists
    const existing = statements.getRoundById.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Round not found' });
    }

    // Calculate differential
    const differential = (113 / slopeRating) * (score - courseRating);
    const roundedDifferential = Math.round(differential * 10) / 10;

    // Update round
    statements.updateRound.run(
      date,
      courseName,
      courseRating,
      slopeRating,
      score,
      par,
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
