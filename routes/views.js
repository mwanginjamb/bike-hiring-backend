const express = require('express')
const path = require('path')
const { isAuthenticated, checkRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

router.get('/history', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'history.html'))
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'register.html'))
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'))
})

router.get('/admin-success', isAuthenticated, checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'dashboard.html'))
})

router.get('/request-password-reset', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'request-password-reset.html'))
})

router.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reset-password.html'))
})
module.exports = router