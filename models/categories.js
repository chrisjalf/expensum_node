'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  categories.init({
    name: DataTypes.STRING,
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
    }
  }, {
    sequelize,
    modelName: 'categories',
  });

  return categories;
};