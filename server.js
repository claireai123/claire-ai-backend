require('dotenv').config();
const express = require('express');
const onboardingRoutes = require('./routes/onboarding');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve Static Files (Intake Form)
app.use(express.static('public')); // This exposes the public folder

// Routes
app.use('/api/onboarding', onboardingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
