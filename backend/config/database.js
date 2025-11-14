const { Sequelize } = require('sequelize');
const path = require('path');

// Load .env variables from the root folder
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('[DB Config] FATAL ERROR: DATABASE_URL is not set in .env file');
    process.exit(1);
}

// Initialize Sequelize
const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Required for Neon
        }
    },
    define: {
        // Use snake_case for table names and columns in the database
        // This is a common convention for PostgreSQL
        underscored: true,
    }
});

module.exports = sequelize;