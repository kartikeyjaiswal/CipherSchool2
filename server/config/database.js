const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'ciphersqlstudio_app',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

/**
 * Execute a query in a specific schema
 * @param {string} schemaName - The schema name (workspace identifier)
 * @param {string} query - SQL query to execute
 * @returns {Promise} Query result
 */
async function executeQuery(schemaName, query) {
  const client = await pool.connect();
  try {
    // Set search path to the workspace schema
    await client.query(`SET search_path TO ${schemaName}, public`);
    
    // Execute the user's query
    const result = await client.query(query);
    
    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      columns: result.fields?.map(field => ({
        name: field.name,
        dataType: field.dataTypeID,
      })) || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  } finally {
    client.release();
  }
}

/**
 * Create a workspace schema if it doesn't exist
 * @param {string} schemaName - The schema name
 */
async function createWorkspaceSchema(schemaName) {
  const client = await pool.connect();
  try {
    // Sanitize schema name to prevent SQL injection
    const sanitizedSchemaName = schemaName.replace(/[^a-zA-Z0-9_]/g, '');
    
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${sanitizedSchemaName}`);
    console.log(`✅ Workspace schema created/verified: ${sanitizedSchemaName}`);
  } catch (error) {
    console.error(`❌ Error creating schema ${schemaName}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Initialize tables for an assignment in a workspace schema
 * @param {string} schemaName - The schema name
 * @param {Array} sampleTables - Array of table definitions from assignment
 */
async function initializeAssignmentTables(schemaName, sampleTables) {
  const client = await pool.connect();
  try {
    const sanitizedSchemaName = schemaName.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Set search path
    await client.query(`SET search_path TO ${sanitizedSchemaName}, public`);
    
    // Create tables and insert data
    for (const table of sampleTables) {
      // Build CREATE TABLE statement
      const columns = table.columns.map(col => {
        const dataType = mapDataType(col.dataType);
        return `${col.columnName} ${dataType}`;
      }).join(', ');
      
      const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.tableName} (${columns})`;
      await client.query(createTableQuery);
      
      // Insert sample data
      if (table.rows && table.rows.length > 0) {
        const columnNames = table.columns.map(col => col.columnName).join(', ');
        const placeholders = table.rows.map((_, i) => {
          const rowPlaceholders = table.columns.map((_, j) => `$${i * table.columns.length + j + 1}`).join(', ');
          return `(${rowPlaceholders})`;
        }).join(', ');
        
        const values = table.rows.flatMap(row => 
          table.columns.map(col => row[col.columnName])
        );
        
        const insertQuery = `INSERT INTO ${table.tableName} (${columnNames}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
        await client.query(insertQuery, values);
      }
    }
    
    console.log(`✅ Tables initialized for assignment in schema: ${sanitizedSchemaName}`);
  } catch (error) {
    console.error(`❌ Error initializing tables:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Map data types from assignment format to PostgreSQL types
 */
function mapDataType(dataType) {
  const typeMap = {
    'INTEGER': 'INTEGER',
    'TEXT': 'TEXT',
    'VARCHAR': 'VARCHAR(255)',
    'REAL': 'REAL',
    'NUMERIC': 'NUMERIC',
    'DATE': 'DATE',
    'TIMESTAMP': 'TIMESTAMP',
    'BOOLEAN': 'BOOLEAN',
  };
  
  return typeMap[dataType.toUpperCase()] || 'TEXT';
}

/**
 * Drop a workspace schema (for cleanup)
 */
async function dropWorkspaceSchema(schemaName) {
  const client = await pool.connect();
  try {
    const sanitizedSchemaName = schemaName.replace(/[^a-zA-Z0-9_]/g, '');
    await client.query(`DROP SCHEMA IF EXISTS ${sanitizedSchemaName} CASCADE`);
    console.log(`✅ Dropped schema: ${sanitizedSchemaName}`);
  } catch (error) {
    console.error(`❌ Error dropping schema:`, error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  executeQuery,
  createWorkspaceSchema,
  initializeAssignmentTables,
  dropWorkspaceSchema,
};

