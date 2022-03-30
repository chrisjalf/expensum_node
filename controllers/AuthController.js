const Users = require('../models').users;
const bcrypt = require('bcryptjs');

module.exports.register = async (req, res) => {
    const body = Keyfilter(req.body, ['name', 'email', 'password']);
    
    if (body.name && body.email && body.password) {
        body.password = bcrypt.hashSync(body.password);

        return Users.create(body).then(user => {
            return ReS(res, 'User registered', { user: user });
        });
    }

    return ReE(res, 'Unable to register', 400);
}