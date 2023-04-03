const Product = require("../models/product");
const Trader = require("../models/trader");
const Category = require("../models/category");
const Review = require("../models/review");
const ApiError = require("../utils/ApiError");
const ProductService = require('../services/product');
const productService = new ProductService()
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, categoryId } = req.body
        const { userId } = res.locals
        if (!name || !description || !price || !categoryId) {
            return next(ApiError.badRequest("Please provide all required fields."))
        }

        const trader = await Trader.findOne({ where: { UserId: userId } })
        const category = await Category.findByPk(categoryId)
        if (!category) {
            return next(ApiError.notFound("Category not found."))
        }

        const product = await Product.create({
            name: name,
            description: description,
            price: price,
            CategoryId: categoryId,
            TraderId: trader.id,
        })

        return res.status(201).send(product)
    } catch (error) {
        next(error)
    }
};

const getProductById = async (req, res, next) => {
    const productId = req.params.id
    try {
        const product = await Product.findByPk(productId, {
            include: [{ model: Review, attributes: ["content"] }, { model: Trader }],
        })

        if (!product) {
            return next(ApiError.notFound("Product not found."))
        }

        return res.status(200).send(product)
    } catch (error) {
        next(error)
    }
};

const getProductsByCategory = async (req, res, next) => {
    const { categoryId } = req.params
    try {
        const category = await Category.findByPk(categoryId)

        if (!category) {
            return next(ApiError.notFound("Category not found."))
        }

        const products = await productService.getAllProductsByCategoryId(categoryId)

        return res.status(200).send(products)
    } catch (error) {
        next(error)
    }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({})

        return res.status(200).send(products)
    } catch (error) {
        next(error)
    }
};
module.exports = { createProduct, getProductById, getProductsByCategory, getProducts };
