const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { executeQuery, createWorkspaceSchema, initializeAssignmentTables } = require('../config/database');
const Assignment = require('../models/Assignment');

/**
 * POST /api/query/execute
 * Execute a SQL query for a specific assignment
 */
router.post('/execute', [
  body('assignmentId').notEmpty().withMessage('assignmentId is required'),
  body('query').notEmpty().withMessage('SQL query is required'),
  body('userId').optional().isString(),
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
    
    const { assignmentId, query, userId } = req.body;
    
    // Get assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }
    
    // Validate query - basic security checks
    const sanitizedQuery = query.trim();
    const upperQuery = sanitizedQuery.toUpperCase();
    
    // Block dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    const hasDangerousKeyword = dangerousKeywords.some(keyword => 
      upperQuery.includes(keyword) && 
      !upperQuery.includes('--') && // Allow comments
      !upperQuery.match(new RegExp(`--.*${keyword}`, 'i')) // Allow commented keywords
    );
    
    if (hasDangerousKeyword) {
      return res.status(400).json({
        success: false,
        error: 'Query contains prohibited operations. Only SELECT queries are allowed.',
      });
    }
    
    // Ensure query starts with SELECT
    if (!upperQuery.startsWith('SELECT')) {
      return res.status(400).json({
        success: false,
        error: 'Only SELECT queries are allowed.',
      });
    }
    
    // Generate workspace schema name
    const schemaName = `workspace_${assignmentId.toString().replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Create workspace schema if it doesn't exist
    await createWorkspaceSchema(schemaName);
    
    // Initialize tables for this assignment if needed
    // Note: In production, you might want to check if tables already exist
    try {
      await initializeAssignmentTables(schemaName, assignment.sampleTables);
    } catch (initError) {
      // If tables already exist, that's fine
      console.log('Tables may already exist:', initError.message);
    }
    
    // Execute the query
    const result = await executeQuery(schemaName, sanitizedQuery);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          rows: result.rows,
          rowCount: result.rowCount,
          columns: result.columns,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        code: result.code,
      });
    }
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

module.exports = router;

