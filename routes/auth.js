const express = require('express')
const { body, validationResult } = require('express-validator')
const { User } = require('../models/index')
const { loginLimiter } = require('../middleware/rateLimiter')
const crypto = require('crypto')
const mailer = require('nodemailer')
const logger = require('../utilities/logger')
require('dotenv').config()

const router = express.Router();

router.post('/register', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
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
        const { username, email, password, role } = req.body
        await User.create({ username, email, password, role })
        res.redirect('/login');
    } catch (error) {
        if (error.name === 'SequalizeUniqueConstraintError') {
            res.status(400).json({ message: 'Username Already Exists' })
        } else {
            next(error)
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
                console.log(`Auth role Accessed: ${user.role}`);
                res.redirect('/admin-success') // dashboard
            } else if (user.role === 'operator') {
                console.log(`Auth role Accessed: ${user.role}`);
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


//logout

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log you out, please try again.' })
        }
        res.json({ message: 'Logout successful' })
    })
})

// csrf token endpoint

router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

// password reset request

router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { email } = req.body
        const user = await User.findByEmail(email)

        if (!user) {
            return res.send(404).json({ message: 'There was a problem with the users identity. ' })
        }

        const token = crypto.randomBytes(20).toString('hex')
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000 //1 hr
        await user.save()


        // send mail with reset Link
        const transporter = mailer.createTransport({
            host: process.env.MAILHOST,
            port: process.env.MAILPORT,
            secure: true,
            auth: {
                user: process.env.MAILUSER,
                pass: process.env.MAILPASS
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: process.env.NODE_ENV === 'dev' ? false : true
            }
        })
        const mailOptions = {
            to: user.email,
            from: process.env.MAILUSER,
            subject: 'PASSWORD RESET',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/reset-password/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
        }

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error(`Mail Error: ${error} `);
            } else {
                logger.info(`Mailer Success: ${info}`)
                console.info(info)
            }
        })
        res.status(200).json({ message: 'Reset Email Sent Successfully.' })


    } catch (error) {
        console.error(`Error in password reset request ${error}`)
        res.status(500).json({ message: 'Error resetting password.' })
    }
})


// Password Reset

router.post('/reset/:token', [
    body('password').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error(`Password confirmation failed to match your preferred password, retry.`)
        }
        return true
    })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findByResetToken(req.params.token)

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' })
        }

        user.password = req.body.password
        user.resetToken = null
        user.resetTokenExpiration = null
        await user.save()
        return res.status(201).json({ message: 'User password reset was successful, proceed to login with the new credentials.' })

    } catch (error) {
        console.error(`Error in password reset: ${error}`)
        return res.status(500).json({ message: 'Error in password reset.' })
    }
})


module.exports = router