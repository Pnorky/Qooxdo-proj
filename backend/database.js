const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'students.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT UNIQUE NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dateOfBirth TEXT,
      gender TEXT,
      address TEXT,
      email TEXT,
      personalPhone TEXT,
      emergencyContact TEXT,
      emergencyContactPhone TEXT,
      relationship TEXT,
      program TEXT,
      yearLevel TEXT,
      gradeSchool TEXT,
      highSchool TEXT,
      college TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating students table:', err.message);
    } else {
      console.log('Students table ready');
    }
  });

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
      // Create default admin user if no users exist
      createDefaultUser();
    }
  });
}

function createDefaultUser() {
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      console.error('Error checking users:', err.message);
      return;
    }
    
    if (row.count === 0) {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['admin', 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating default user:', err.message);
          } else {
            console.log('Default user created: username=admin, password=admin');
          }
        }
      );
    }
  });
}

// Helper function to run queries with promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
}

module.exports = { db, run, get, all, close };
