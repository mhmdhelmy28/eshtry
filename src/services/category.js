const Category = require('../models/category');
 class CategoryService {
     async  findOneByNameAndDescription(name, description){
        const category = await Category.findOne({ where: { name, description } })
         return category;
     }
     
      async findCategoryById(categoryId){
         const category = await Category.findByPk(categoryId)
         return category
     }
}

module.exports = CategoryService;



