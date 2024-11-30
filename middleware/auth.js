const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        req.currentUser = req.session.user
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

const attachUserToRequest = (req, res, next) => {
    if (req.session && req.session.user) {
        req.currentUser = req.session.user
    } else {
        req.currentUser = null
    }
    next()
}



module.exports = { isAuthenticated, checkRole, attachUserToRequest }