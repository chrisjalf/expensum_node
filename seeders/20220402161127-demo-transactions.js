'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('transactions', [
      {
        user_id: 1,
        cat_id: 2,
        description: 'Fly to Paris',
        type: 'Deduct',
        amount: 523.00,
        trans_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 1,
        cat_id: 3,
        description: 'Groceries',
        type: 'Deduct',
        amount: 179.00,
        trans_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 1,
        cat_id: 7,
        description: 'Salary & Bonus',
        type: 'Add',
        amount: 1265.00,
        trans_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 1,
        cat_id: 8,
        description: 'Clothes',
        type: 'Deduct',
        amount: 210.00,
        trans_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 1,
        cat_id: 1,
        description: 'Rent',
        type: 'Deduct',
        amount: 600.00,
        trans_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('transactions', null, {});
  }
};