const Product = require('../models/product')


async function getAllProductsByCategoryId(categoryId){
    const products = await Product.findAll({
        where: { CategoryId: categoryId },
    });
    return products;
}