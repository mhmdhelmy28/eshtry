const Category = require('../models/category');
async function findCategoryByNameAndDescription(name, description){
   const category = await Category.findOne({ where: { name, description } })
    return category;
}

async function findCategoryById(categoryId){
    const category = await Category.findByPk(categoryId)
    return category
}


