const express = require('express')
const path = require('path')
const { isAuthenticated, checkRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', isAuthenticated, checkRole('operator'), (req, res) => {
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

module.exports = router