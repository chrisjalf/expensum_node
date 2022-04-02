const Users = require('../models').users;
const bcrypt = require('bcryptjs');

module.exports.register = async (req, res) => {
    const body = Keyfilter(req.body, ['name', 'email', 'password']);
    
    if (body.name && body.email && body.password) {
        body.password = bcrypt.hashSync(body.password);

        return Users.create(body).then(user => {
            return ReS(res, 'User registered', { user: user.toWeb() });
        });
    }

    return ReE(res, 'Unable to register', 400);
}

module.exports.login = async (req, res) => {
    const body = Keyfilter(req.body, ['email', 'password']);

    if (body.email && body.password) {
        return Users.findOne({ 
            where: { email: body.email }
        }).then(user => {
            if (user) {
                return bcrypt.compare(body.password, user.password).then(match => {
                    if (match)
                        return ReS(res, '', { user: user.toWeb(), token: user.getJwt() });
                });
            }
                
            throw 'Email and password combination does not exist';
        }).catch(err => {
            return ReE(res, err, 400);
        });
    }

    return ReE(res, 'Unable to login', 400);
}