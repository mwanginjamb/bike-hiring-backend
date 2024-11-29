const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        // Attach user to request for use in subsequent middleware
        req.user = req.session.user
        next()
    } else {
        res.redirect('/login')
    }
}

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            next()
        }
        else {
            res.status(403).send('Access Denied pal.')
        }
    }
}

module.exports = { isAuthenticated, checkRole }