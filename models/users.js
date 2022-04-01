'use strict';
const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      get() {
        const c = this.getDataValue('createdAt');
        return c ? moment(c).format('YYYY-MM-DD HH:mm:ss') : null;
      }
    },
    updatedAt: {
      type: DataTypes.DATE,
      get() {
        const c = this.getDataValue('updatedAt');
        return c ? moment(c).format('YYYY-MM-DD HH:mm:ss') : null;
      }
    },
  }, {
    sequelize,
    modelName: 'users'
  });

  users.prototype.toWeb = function() {
    let json = this.toJSON();
    delete json['password'];

    return json;
  }

  users.prototype.getJwt = function() {
    const expirationTime = '1h';
    const token = jwt.sign(
      { consumer_id: this.consumer_id },
      'this1sUserToken',
      { expiresIn: expirationTime }
    );

    return `Bearer ${token}`;
  }

  return users;
}