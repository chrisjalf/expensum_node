const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Users = require('../models').users;

module.exports.UserAuth = passport => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'this1sUserToken'
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        if (jwt_payload?.id) {
            Users.findByPk(jwt_payload.id).then(user => {
                if (user)
                    return done(null, user);
                
                throw 'User not found';
            }).catch(err => { return done(err, false); });
        }
    }));
}