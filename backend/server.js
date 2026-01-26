const express = require('express');
const cors = require('cors');
const studentsRouter = require('./routes/students');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/students`);
});
