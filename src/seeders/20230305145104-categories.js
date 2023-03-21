module.exports = {
  async up(queryInterface, Sequelize) {
    

    await queryInterface.bulkInsert('Categories', [
      { name: 'clothes', description: "This section contains clothes" },
      { name: 'electronics', description: "This section contain all types of electronics. i.e: mobiles, laptops, ..etc." },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};