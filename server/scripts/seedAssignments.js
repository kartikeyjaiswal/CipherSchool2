/**
 * Seed script to insert sample assignments into MongoDB
 * Run with: node server/scripts/seedAssignments.js
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const sampleAssignments = [
  {
    title: 'Find All Customers',
    description: 'A simple query to retrieve all customer records',
    difficulty: 'Easy',
    question: 'Write a SQL query to select all columns from the customers table.',
    sampleTables: [
      {
        tableName: 'customers',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'name', dataType: 'TEXT' },
          { columnName: 'email', dataType: 'TEXT' },
          { columnName: 'created_at', dataType: 'DATE' },
        ],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' },
      ],
    },
  },
  {
    title: 'Filter Customers by Email Domain',
    description: 'Learn to use WHERE clause with pattern matching',
    difficulty: 'Easy',
    question: 'Write a SQL query to find all customers whose email ends with "@example.com".',
    sampleTables: [
      {
        tableName: 'customers',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'name', dataType: 'TEXT' },
          { columnName: 'email', dataType: 'TEXT' },
        ],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
          { id: 3, name: 'Bob Johnson', email: 'bob@other.com' },
          { id: 4, name: 'Alice Brown', email: 'alice@example.com' },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com' },
      ],
    },
  },
  {
    title: 'Join Customers and Orders',
    description: 'Practice JOIN operations to combine data from multiple tables',
    difficulty: 'Medium',
    question: 'Write a SQL query to retrieve customer names along with their order IDs. Use an INNER JOIN.',
    sampleTables: [
      {
        tableName: 'customers',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'name', dataType: 'TEXT' },
          { columnName: 'email', dataType: 'TEXT' },
        ],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
        ],
      },
      {
        tableName: 'orders',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'customer_id', dataType: 'INTEGER' },
          { columnName: 'total', dataType: 'REAL' },
          { columnName: 'order_date', dataType: 'DATE' },
        ],
        rows: [
          { id: 101, customer_id: 1, total: 99.99, order_date: '2024-01-20' },
          { id: 102, customer_id: 1, total: 149.50, order_date: '2024-01-21' },
          { id: 103, customer_id: 2, total: 79.99, order_date: '2024-01-22' },
          { id: 104, customer_id: 3, total: 199.99, order_date: '2024-01-23' },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { name: 'John Doe', id: 101 },
        { name: 'John Doe', id: 102 },
        { name: 'Jane Smith', id: 103 },
        { name: 'Bob Johnson', id: 104 },
      ],
    },
  },
  {
    title: 'Count Orders per Customer',
    description: 'Use aggregate functions and GROUP BY',
    difficulty: 'Medium',
    question: 'Write a SQL query to count the number of orders for each customer. Show customer name and order count.',
    sampleTables: [
      {
        tableName: 'customers',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'name', dataType: 'TEXT' },
        ],
        rows: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Bob Johnson' },
        ],
      },
      {
        tableName: 'orders',
        columns: [
          { columnName: 'id', dataType: 'INTEGER' },
          { columnName: 'customer_id', dataType: 'INTEGER' },
          { columnName: 'total', dataType: 'REAL' },
        ],
        rows: [
          { id: 101, customer_id: 1, total: 99.99 },
          { id: 102, customer_id: 1, total: 149.50 },
          { id: 103, customer_id: 2, total: 79.99 },
          { id: 104, customer_id: 3, total: 199.99 },
          { id: 105, customer_id: 1, total: 49.99 },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { name: 'John Doe', count: 3 },
        { name: 'Jane Smith', count: 1 },
        { name: 'Bob Johnson', count: 1 },
      ],
    },
  },
];

async function seedAssignments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphersqlstudio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing assignments (optional - comment out if you want to keep existing)
    // await Assignment.deleteMany({});
    // console.log('✅ Cleared existing assignments');

    // Insert sample assignments
    const inserted = await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Inserted ${inserted.length} sample assignments`);

    // Display inserted assignments
    inserted.forEach((assignment) => {
      console.log(`  - ${assignment.title} (${assignment.difficulty})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  }
}

seedAssignments();

