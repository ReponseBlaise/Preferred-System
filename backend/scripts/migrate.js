const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('Running migrations...');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('Error executing statement:', error.message);
        console.error('Statement:', statement);
      }
    }

    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();