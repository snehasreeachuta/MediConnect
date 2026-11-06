const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/environment');

async function initializeDatabase() {
  console.log('Connecting to MySQL server at', `${config.db.host}:${config.db.port}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });
    console.log('Connected to MySQL successfully.');

    // 1. Create Database
    console.log(`Ensuring database '${config.db.database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${config.db.database}\`;`);

    // 2. Execute Schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Applying database schema from schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('Schema applied successfully.');
    } else {
      console.warn('schema.sql not found at', schemaPath);
    }

    // 3. Execute Sample Data
    const sampleDataPath = path.join(__dirname, '../../database/sample_data.sql');
    if (fs.existsSync(sampleDataPath)) {
      console.log('Seeding sample data from sample_data.sql...');
      const sampleDataSql = fs.readFileSync(sampleDataPath, 'utf8');
      await connection.query(sampleDataSql);
      console.log('Sample data seeded successfully.');
    } else {
      console.warn('sample_data.sql not found at', sampleDataPath);
    }

    console.log('\n MediConnect Database initialization completed successfully!');
    console.log('Sample Accounts:');
    console.log(' - Admin:   admin@mediconnect.local      / Admin@123456');
    console.log(' - Doctor:  sarah.jenkins@mediconnect.local / Doctor@123456');
    console.log(' - Patient: patient@mediconnect.local    / Patient@123456');
  } catch (err) {
    console.error(' Database initialization failed:');
    console.error(err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nHINT: Ensure your MySQL service (e.g. XAMPP, MySQL Server) is running on port', config.db.port);
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
