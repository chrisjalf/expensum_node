const bcrypt = require('bcryptjs');
const moment = require('moment');
const { checkSchema, validationResult } = require('express-validator');

const Users = require('../models').users;
const Categories = require('../models').categories;
const Transactions = require('../models').transactions;

module.exports.register = async (req, res) => {
    await checkSchema({
        name: {
            notEmpty: true,
            errorMessage: 'Name is required'
        },
        email: {
            notEmpty: true,
            errorMessage: 'Email is required',
            isEmail: {
                errorMessage: 'Valid email format is required'
            }
        },
        password: {
            notEmpty: true,
            errorMessage: 'Password is required',
            isLength: {
                options: { min: 8, max: 32 },
                errorMessage: 'Password must be between 8 and 32 characters'
            }
        }
    }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return ReE(res, errors.array()[0].msg, 400);

    const body = Keyfilter(req.body, ['name', 'email', 'password']);
    body.password = bcrypt.hashSync(body.password);

    Users.create(body).then(user => {
        return ReS(res, 'User registered', { user: user.toWeb() });
    }).catch(err => {
        return ReE(res, err, 400);
    });
}

module.exports.login = async (req, res) => {
    await checkSchema({
        email: {
            notEmpty: true,
            errorMessage: 'Email is required',
            isEmail: {
                errorMessage: 'Valid email format is required'
            }
        },
        password: {
            notEmpty: true,
            errorMessage: 'Password is required',
            isLength: {
                options: { min: 8, max: 32 },
                errorMessage: 'Password must be between 8 and 32 characters'
            }
        }
    }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return ReE(res, errors.array()[0].msg, 400);

    const body = Keyfilter(req.body, ['email', 'password']);

    Users.findOne({ 
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

module.exports.transactionCreate = async (req, res) => {
    await checkSchema({
        cat_id: {
            notEmpty: true,
            errorMessage: 'Category ID is required',
            custom: {
                options: value => {
                    return Categories.findOne({
                        where: { id: value }
                    }).then(cat => {
                        if (!cat) return Promise.reject();
                    });
                },
                errorMessage: 'Valid category ID is required'
            },
            toInt: true
        },
        description: {
            notEmpty: true,
            errorMessage: 'Description is required'
        },
        type: {
            notEmpty: true,
            errorMessage: 'Type is required',
            isIn: {
                options: 'Add,Deduct',
                errorMessage: 'Type must be either Add/Deduct'
            }
        },
        amount: {
            notEmpty: true,
            errorMessage: 'Amount is required',
            isCurrency: {
                options: { thousands_separator: '' },
                errorMessage: 'Amount must be a currency'
            },
            toFloat: true
        },
        trans_date: {
            notEmpty: true,
            errorMessage: 'Transaction date is required',
            custom: {
                options: value => {
                    return moment(value).isValid()
                },
                errorMessage: 'Valid transaction date is required'
            }
        }
    }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return ReE(res, errors.array()[0].msg, 400);

    const body = Keyfilter(req.body, ['cat_id', 'description', 'type', 'amount', 'trans_date']);
    
    Transactions.create({
        user_id: req.user.id,
        ...body
    }).then(transaction => {
        return ReS(res, 'Transaction created', { transaction: transaction });
    }).catch(err => {
        return ReE(res, err, 400);
    });
}

module.exports.test = async (req, res) => {
    await checkSchema({
        name: {
            notEmpty: true,
            errorMessage: 'Name is required',
            isLength: {
                options: { min: 5 },
                errorMessage: 'Name must be at least 5 characters'
            }
        },
        password: {
            notEmpty: true,
            errorMessage: 'Password is required',
            isLength: {
                options: { min: 10 },
                errorMessage: 'Password must be at least 10 characters'
            }
        }
    }).run(req);

    const errors = validationResult(req);

    /**
     * Sample errors.array() content
     *  [
            {
                "msg": "Name is required",
                "param": "name",
                "location": "body"
            },
            {
                "msg": "Password is required",
                "param": "password",
                "location": "body"
            }
        ]
     */

    if (!errors.isEmpty())
        return ReE(res, errors.array()[0].msg, 400);

    return ReS(res, 'Yay', 200);
}