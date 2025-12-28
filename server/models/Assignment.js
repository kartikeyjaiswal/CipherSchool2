const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
  columnName: {
    type: String,
    required: true,
  },
  dataType: {
    type: String,
    required: true,
    enum: ['INTEGER', 'TEXT', 'VARCHAR', 'REAL', 'NUMERIC', 'DATE', 'TIMESTAMP', 'BOOLEAN'],
  },
});

const SampleTableSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: true,
  },
  columns: {
    type: [ColumnSchema],
    required: true,
  },
  rows: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
});

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  question: {
    type: String,
    required: true,
  },
  sampleTables: {
    type: [SampleTableSchema],
    required: true,
  },
  expectedOutput: {
    type: {
      type: String,
      required: true,
      enum: ['table', 'single_value', 'column', 'count', 'row'],
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
AssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema);

