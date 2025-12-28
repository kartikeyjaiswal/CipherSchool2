const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');

/**
 * GET /api/assignments
 * Get all assignments
 */
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .select('_id title description difficulty createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/assignments/:id
 * Get a specific assignment with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }
    
    // Get user progress if userId is provided (optional)
    let userProgress = null;
    if (req.query.userId) {
      userProgress = await UserProgress.findOne({
        userId: req.query.userId,
        assignmentId: assignment._id,
      });
    }
    
    res.json({
      success: true,
      data: {
        assignment,
        userProgress: userProgress || {
          sqlQuery: '',
          isCompleted: false,
          attemptCount: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/assignments/:id/progress
 * Save user progress for an assignment
 */
router.post('/:id/progress', async (req, res) => {
  try {
    const { userId, sqlQuery, isCompleted } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    const progress = await UserProgress.findOneAndUpdate(
      {
        userId,
        assignmentId: req.params.id,
      },
      {
        userId,
        assignmentId: req.params.id,
        sqlQuery: sqlQuery || '',
        isCompleted: isCompleted || false,
        lastAttempt: new Date(),
        $inc: { attemptCount: 1 },
      },
      {
        upsert: true,
        new: true,
      }
    );
    
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

