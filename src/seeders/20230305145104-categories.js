module.exports = {
  async up(queryInterface) {
    

    await queryInterface.bulkInsert('Categories', [
      { name: 'clothes', description: "This section contains clothes" },
      { name: 'electronics', description: "This section contain all types of electronics. i.e: mobiles, laptops, ..etc." },
    ]);
  },

  async down(queryInterface,) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};