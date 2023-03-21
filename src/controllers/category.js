const Category = require("../models/category");
const ApiError = require('../utils/ApiError')
const logger = require('../utils/logger');

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return  next(ApiError.badRequest("Name and description are required." ));
    }

    const category = await Category.findOne({ where: { name, description } });
    if (category) {
      return  next(ApiError.badRequest("Category already exists."));
    }

    const newCategory = await Category.create({ name, description });
    res.status(201).send(newCategory);
  } catch (error) {
    
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({});
    res.status(200).send(categories);
  } catch (error) {
    
   next(error);
  }
};

module.exports = { createCategory, getAllCategories };