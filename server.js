const express = require('express')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const csrf = require('csurf')
const session = require('express-session')
const { sequelize } = require('./models/index')
const tripRoutes = require("./routes/trips")
const viewRoutes = require("./routes/views")
const authRoutes = require("./routes/auth")
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

// middleware 
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}))

// CSRF protection
app.use(csrf())
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', tripRoutes)
app.use('/', viewRoutes)
app.use('/auth', authRoutes)

// Error handling Middleware
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send('System Errors transpired and conspired to kick you out! Sorry mate.')
})

sequelize.sync().then(() => {
    console.log('DB Synched.')
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}`)
    })
});