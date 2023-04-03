'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const [, adminRole, ] = await queryInterface.bulkInsert(
      'Roles',
      [
        { name: 'user', createdAt: new Date(), updatedAt: new Date() },
        { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
        { name: 'trader', createdAt: new Date(), updatedAt: new Date() },
      ],
       { returning: true }
    );

    const passwordHash = await bcrypt.hash('PassworD@123', 10);

    await queryInterface.bulkInsert(
      'Users',
      [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'admin',
          password: passwordHash,
          RoleId: adminRole.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      
    );

    return Promise.resolve();
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
    return Promise.resolve();
  },
};
