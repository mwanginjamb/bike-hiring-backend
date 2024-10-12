const express = require('express')
const { body, validationResult } = require('express-validator')
const { User } = require('../models/index')
const { loginLimiter } = require('../middleware/rateLimiter')

const router = express.Router();

router.post('/register', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 8 }),
    body('passwordConfirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation failed, retry signing in.')
        }
        return true;
    }),
    body('role').isIn(['operator', 'admin'])
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password, role } = req.body
        await User.create({ username, password, role })
        res.redirect('/login');
    } catch (error) {
        if (error.name === 'SequalizeUniqueConstraintError') {
            res.status(400).send('Username Already Exists')
        } else {
            console.error(`Error registering user: ${error}`)
            res.status(500).send(`Error registering user`)
        }
    }
})


router.post('/login', loginLimiter, [
    body('username').trim().escape(),
    body('password').escape()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { username, password } = req.body
        const user = await User.findByUsername(username)

        if (user && await user.validatePassword(password)) {
            req.session.user = { id: user.id, username: user.username, role: user.role }

            if (user.role === 'admin') {
                res.redirect('/admin-success') // dashboard
            } else if (user.role === 'operator') {
                res.redirect('/') //operator success
            } else {
                res.redirect('/history');
            }
        } else {
            res.status(400).send('Invalid Username or Password')
        }
    } catch (error) {
        console.log(`Error loging in: ${error}`)
        res.status(500).send(`Error Logging in`)
    }
})

// csrf token endpoint

router.get('/csrf-token', (res, req) => {
    res.json({ csrfToken: req.csrfToken() })
})