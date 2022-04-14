'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.cat_id = this.belongsTo(models.categories, { foreignKey: 'cat_id' });
    }
  }

  transactions.init({
    user_id: DataTypes.INTEGER,
    cat_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    amount: {
      type: DataTypes.DECIMAL,
      get() {
        const c = this.getDataValue('amount');
        return typeof c === 'number' ? c.toFixed(2) : c;
      }
    },
    trans_date: {
      type: DataTypes.DATE,
      get() {
        const c = this.getDataValue('trans_date');
        return c ? moment(c).format('YYYY-MM-DD HH:mm:ss') : null;
      }
    },
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
    modelName: 'transactions',
  });

  return transactions;
};