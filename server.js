const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/interview', require('./src/routes/interviewRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));

app.get('/', (req, res) => {
    res.send('Interview Coach API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
