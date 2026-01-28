const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');

/**
 * Extract numeric part from yearLevel string
 * Handles formats like "p4", "rr3", "r2", "4", "1st Year", "2nd Year", etc.
 * @param {String|Number} yearLevel - Year level value
 * @return {String} Numeric year level (1-4) or empty string
 */
function normalizeYearLevel(yearLevel) {
  if (!yearLevel) return "";
  
  // If it's already a number, convert to string
  if (typeof yearLevel === 'number') {
    return String(yearLevel);
  }
  
  const str = String(yearLevel).trim();
  if (!str) return "";
  
  // Extract the last digit from the string
  const match = str.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    // Ensure it's between 1-4 (valid year levels)
    if (num >= 1 && num <= 4) {
      return String(num);
    }
  }
  
  return str; // Return original if no valid number found
}

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await all('SELECT * FROM students ORDER BY createdAt DESC');
    // Normalize yearLevel for all students
    const normalizedStudents = students.map(student => ({
      ...student,
      yearLevel: normalizeYearLevel(student.yearLevel)
    }));
    res.json(normalizedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await get('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Normalize yearLevel
    student.yearLevel = normalizeYearLevel(student.yearLevel);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET student by studentId
router.get('/studentId/:studentId', async (req, res) => {
  try {
    const student = await get('SELECT * FROM students WHERE studentId = ?', [req.params.studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Normalize yearLevel
    student.yearLevel = normalizeYearLevel(student.yearLevel);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new student
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      email,
      personalPhone,
      emergencyContact,
      emergencyContactPhone,
      relationship,
      program,
      yearLevel,
      gradeSchool,
      highSchool,
      college
    } = req.body;

    // Convert dateOfBirth to string if it's a Date object
    const dobString = dateOfBirth ? (dateOfBirth instanceof Date ? dateOfBirth.toISOString() : dateOfBirth) : null;
    
    // Normalize yearLevel to numeric string
    const normalizedYearLevel = normalizeYearLevel(yearLevel);

    const result = await run(
      `INSERT INTO students (
        studentId, firstName, lastName, dateOfBirth, gender, address,
        email, personalPhone, emergencyContact, emergencyContactPhone,
        relationship, program, yearLevel, gradeSchool, highSchool, college
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, firstName, lastName, dobString, gender, address,
        email, personalPhone, emergencyContact, emergencyContactPhone,
        relationship, program, normalizedYearLevel, gradeSchool, highSchool, college
      ]
    );

    const newStudent = await get('SELECT * FROM students WHERE id = ?', [result.id]);
    // Normalize yearLevel in response
    newStudent.yearLevel = normalizeYearLevel(newStudent.yearLevel);
    res.status(201).json(newStudent);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Student ID already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      email,
      personalPhone,
      emergencyContact,
      emergencyContactPhone,
      relationship,
      program,
      yearLevel,
      gradeSchool,
      highSchool,
      college
    } = req.body;

    const dobString = dateOfBirth ? (dateOfBirth instanceof Date ? dateOfBirth.toISOString() : dateOfBirth) : null;
    
    // Normalize yearLevel to numeric string
    const normalizedYearLevel = normalizeYearLevel(yearLevel);

    const result = await run(
      `UPDATE students SET
        studentId = ?, firstName = ?, lastName = ?, dateOfBirth = ?, gender = ?,
        address = ?, email = ?, personalPhone = ?, emergencyContact = ?,
        emergencyContactPhone = ?, relationship = ?, program = ?, yearLevel = ?,
        gradeSchool = ?, highSchool = ?, college = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        studentId, firstName, lastName, dobString, gender, address,
        email, personalPhone, emergencyContact, emergencyContactPhone,
        relationship, program, normalizedYearLevel, gradeSchool, highSchool, college,
        req.params.id
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updatedStudent = await get('SELECT * FROM students WHERE id = ?', [req.params.id]);
    // Normalize yearLevel in response
    updatedStudent.yearLevel = normalizeYearLevel(updatedStudent.yearLevel);
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
