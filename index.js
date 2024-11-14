require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Existing webhook mapping logic
// ... [previous webhook mapping code remains the same]

// Middleware
app.use(cors());
app.use(bodyParser.json({
    limit: '50mb' // Support large payloads for attachments
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/webhook_admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Passport Authentication
const User = require('./admin-panel/src/models/User');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

// Existing routes
app.post('/webhook', async (req, res) => {
    // ... [previous webhook handling code]
});

app.get('/health', (req, res) => {
    // ... [previous health check code]
});

app.get('/', (req, res) => {
    // ... [previous root endpoint code]
});

// Admin Panel Routes
const webhookRoutes = require('./admin-panel/src/routes/webhookRoutes')();
app.use('/api/webhooks', webhookRoutes);

const authRoutes = require('./admin-panel/src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'admin-panel/src/frontend/build')));
    
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin-panel/src/frontend/build', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Configured webhook mappings:', 
        Object.keys(WEBHOOK_MAPPING).map(email => ({
            email,
            config_key: email === 'CATCHALL' ? 'WEBHOOK_MAP_CATCHALL' :
                `WEBHOOK_MAP_${email.replace(/\./g, '_').replace(/\+/g, '_plus_').toUpperCase()}`
        }))
    );
    console.log('Waiting for email webhooks...');
});

// Export functions for testing
module.exports = {
    configKeyToEmail,
    getWebhookUrl,
    createEmailEmbed,
    createAttachmentEmbeds,
    WEBHOOK_MAPPING
};
