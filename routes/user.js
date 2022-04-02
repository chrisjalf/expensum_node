const express = require('express');
const router = express.Router();
const passport = require('passport');

const UserController = require('../controllers/UserController');

AuthMiddleware = (req, res, next) => {
    require('../middleware/passport').UserAuth(passport);

    passport.authenticate('jwt', (err, user, info) => {
        if (!user)
            return ReE(res, info?.message ? info.message : err, 401);

        req.user = user;

        return next();
    })(req, res, next);
}

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/test', AuthMiddleware, (req, res) => { return ReS(res, '', { id: req.user.id }); });

module.exports = router;