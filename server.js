const express = require('express')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const { sequelize } = require('./models/index')
const logger = require('./utilities/logger')

const tripRoutes = require("./routes/trips")
const viewRoutes = require("./routes/views")
const authRoutes = require("./routes/auth")

require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

// middleware

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
    console.log('Trust proxy is enabled for production');
} else {
    app.set('trust proxy', false);
    console.log('Trust proxy is disabled for non-production environments');
}

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'dev' ? 'Lax' : 'none'
    }
}))


app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY'); // Disallow framing
    res.setHeader('X-XSS-Protection', '1; mode=block'); // Block XSS attacks
    next();
});

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Allow resources from your domain only by default
            scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'], // Allow scripts from Cloudflare
            styleSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'], // Allow styles from Cloudflare
            styleSrcElem: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'], // External styles
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'], // Allow fonts from Cloudflare
            imgSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'data:', 'https://cdn.jsdelivr.net'], // Allow images, including inline
            connectSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'], // Allow API calls (e.g., AJAX)
            frameSrc: ["'self'"], // Restrict iframes (modify if embedding Cloudflare elements)
            objectSrc: ["'none'"], // Prevent <object>, <embed>, <applet>
            upgradeInsecureRequests: [], // Ensure all requests are HTTPS
            reportUri: "/csp-violation-report-endpoint",
        },
    })
);


// CSRF protection
const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 // 1-hour
    }

})
app.use(csrfProtection)

// log CSP violations

app.post('/csp-violation-report-endpoint', (req, res) => {
    console.log('CSP Violation:', req.body || 'No data');
    res.status(204).end();
});

// serve static files
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', (req, res, next) => {
    logger.info(`API Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
}, tripRoutes);

app.use('/', (req, res, next) => {
    logger.info(`View Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
}, viewRoutes);

app.use('/auth', (req, res, next) => {
    logger.info(`Auth Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
}, authRoutes);

// Error handling Middleware
app.use((err, req, res, next) => {
    if (err.code == 'EBADCSRFTOKEN') {
        logger.warn('Invalid CSRF token detected');
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    // Log general runtime errors
    logger.error(`Error during request ${req.method} ${req.originalUrl}`, {
        error: err.message,
        stack: err.stack
    });

    res.status(500).send('System Errors Occurred! Sorry mate.', err)
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown:', err.message, { stack: err.stack });
    // Optionally: Gracefully shut down the app after logging
    process.exit(1); // Exit the process to prevent any unstable state
});

sequelize.sync().then(() => {
    console.log('DB Synched.')
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}`)
    })
});