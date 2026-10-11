'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('products', [
      {
        product_name: 'Laptop',
        price: '999.99',
      },
      {
        product_name: 'Wireless Mouse',
        price: '29.99',
      },
      {
        product_name: 'Mechanical Keyboard',
        price: '89.99',
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', {
      product_name: ['Laptop', 'Wireless Mouse', 'Mechanical Keyboard'],
    });
  },
};
