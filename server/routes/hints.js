const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const { getHintFromLLM } = require('../services/llmService');

/**
 * POST /api/hints/get
 * Get an intelligent hint for an assignment
 */
router.post('/get', [
  body('assignmentId').notEmpty().withMessage('assignmentId is required'),
  body('userQuery').optional().isString(),
  body('errorMessage').optional().isString(),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    
    const { assignmentId, userQuery, errorMessage } = req.body;
    
    // Get assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }
    
    // Get hint from LLM
    const hint = await getHintFromLLM(assignment, userQuery, errorMessage);
    
    res.json({
      success: true,
      data: {
        hint,
      },
    });
  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate hint',
    });
  }
});

module.exports = router;

