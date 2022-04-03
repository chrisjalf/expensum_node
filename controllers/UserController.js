const bcrypt = require('bcryptjs');

const Users = require('../models').users;
const Categories = require('../models').categories;
const Transactions = require('../models').transactions;

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

module.exports.categories = async (req, res) => {
    Categories.findAll().then(categories => {
        return ReS(res, '', { categories: categories });
    }).catch(err => {
        return ReE(res, err, 400);
    });
}

module.exports.category = async (req, res) => {
    Categories.findOne({ where: { id: req.params.id } }).then(category => {
        if (category)
            return ReS(res, '', { category: category });

        throw 'Category not found';
    }).catch(err => {
        return ReE(res, err, 400);
    });
}

module.exports.transactions = async (req, res) => {
    Transactions.findAll({
        where: { user_id: req.user.id },
        include: [{
            model: Categories
        }]
    }).then(transactions => {
        return ReS(res, '', { transactions: transactions, count: transactions.length });
    }).catch(err => {
        return ReE(res, err, 400);
    });
}

module.exports.transaction = async (req, res) => {
    Transactions.findOne({
        where: { id: req.params.id },
        include: [{
            model: Categories
        }]
    }).then(transaction => {
        if (transaction)
            return ReS(res, '', { transaction: transaction });

        throw 'Transaction not found';
    }).catch(err => {
        return ReE(res, err, 400);
    });
}