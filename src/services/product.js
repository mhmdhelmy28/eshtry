const Product = require('../models/product')

class ProductService {
async getAllProductsByCategoryId(categoryId){
    const products = await Product.findAll({
        where: { CategoryId: categoryId },
    });
    return products;
}
}
module.exports = ProductService;