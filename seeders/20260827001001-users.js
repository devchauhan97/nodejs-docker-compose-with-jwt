'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword= await bcrypt.hash('12345', 10); 

    await queryInterface.bulkInsert('users', [
      {
        user_name: 'john_doe',
        password: hashedPassword,
      },
      {
        user_name: 'jane_smith',
        password: hashedPassword,
      },
      {
        user_name: 'bob_wilson',
        password: hashedPassword,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      user_name: ['sunil', 'dharmender', 'john_doe', 'jane_smith', 'bob_wilson', 'alice_johnson', 'charlie_brown', 'david_clark', 'emily_davis', 'frank_evans', 'grace_harris', 'henry_jackson', 'irene_miller', 'julia_rodriguez', 'sunil']
    });
  },
};
