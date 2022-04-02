'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  transactions.init({
    user_id: DataTypes.INTEGER,
    cat_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
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
}