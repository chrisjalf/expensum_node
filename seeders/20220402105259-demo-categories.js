'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('categories', [
      {
        name: 'Housing',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transportation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Utilities',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Medical & Insurance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Entertainment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Savings & Investments',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clothing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('categories', null, {});
  }
};
