const bcrypt = require('bcryptjs');
const moment = require('moment');
const sequelize = require('sequelize');
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
    }).then(async user => {
        let authorized = false;

        if (user) {
            authorized = await bcrypt.compare(body.password, user.password).then(match => {
                return match;
            });
        }
        
        if (!user || !authorized)
            throw 'Email and password combination does not exist';
        else
            return ReS(res, '', { user: user.toWeb(), token: user.getJwt() });
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
    const body = Keyfilter(req.body, ['current_month', 'cat_id']);
    let conditions = {}, misc = {};

    if (FlagTruthy(body.current_month)) {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD 23:59:59');
        conditions.trans_date = { [sequelize.Op.between]: [startOfMonth, endOfMonth] };
    }

    if (body.cat_id)
        conditions.cat_id = body.cat_id

    Transactions.findAll({
        where: { user_id: req.user.id, ...conditions },
        include: [{
            model: Categories
        }]
    }).then(async transactions => {
        if (conditions.trans_date) {
            let incomes = [], expenses = [];

            transactions.forEach(trans => {
                if (trans.type === 'Add')
                    incomes.push(+trans.amount);
                else
                    expenses.push(+trans.amount);
            });

            const sumOfAmountByType = await Transactions.findAll({
                where: { user_id: req.user.id },
                attributes: ['type', [sequelize.fn('sum', sequelize.col('amount')), 'total']],
                group: ['type'],
                raw: true
            });
            const amount_type = sumOfAmountByType.reduce((obj, item) => (obj[item.type === 'Add' ? 'income' : 'expense'] = item.total, obj), {});
            const balance = parseFloat(amount_type.income) - parseFloat(amount_type.expense);

            misc.income = incomes.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(2);
            misc.expense = expenses.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(2);
            misc.balance = balance < 0 ? `- $${Math.abs(balance).toFixed(2)}` : `$${balance.toFixed(2)}`;
        }

        return ReS(res, '', { transactions: transactions, count: transactions.length, ...misc });
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