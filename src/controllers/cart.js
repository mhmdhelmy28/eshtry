const { sequelize } = require("../models/index");
const Product = require("../models/product");
const ApiError = require("../utils/ApiError");
const CartService = require('../services/cart');
const OrderService = require('../services/order');
const orderService = new OrderService()
const cartService = new CartService()
const getCart = async (req, res, next) => {
  const { userId } = res.locals
  try {
    const cart = await cartService.findCartWithItsItemsByUserId(userId)
    res.status(200).send(cart)
  } catch (error) {
    next(error)
  }
};

const addToCart = async (req, res, next) => {
  const { userId } = res.locals
  const { id, quantity } = req.body

  if (!id || !quantity) {
    return next(ApiError.badRequest("Please provide all required fields"))
  }

  try {
    const cart = await cartService.findCartByUserId(userId)
    const product = await Product.findByPk(id)

    if (!product) {
      return next(ApiError.notFound("Product not found"))
    }

    const item = await cartService.createCartItem(
      cart.id,
      product.id,
      product.price,
      quantity,  
    )

    res.status(201).send(item)
  } catch (error) {
    next(error)
  }
};

const deleteFromCart = async (req, res, next) => {
  const cartItemId = req.params.id
  try {
    const item = await cartService.findCartItem(cartItemId)
    if (!item) {
      return next(ApiError.notFound("Item not found in cart"))
    }
    await item.destroy()
    res.status(200).send(item)
  } catch (error) {
    next(error)
  }
};


const deleteAllFromCart = async (req, res, next) => {
  const { userId } = res.locals
  let txn = undefined
  try {
    const cart = await cartService.findCartByUserId(userId)
    txn = await sequelize.transaction({})
    await cartService.deleteAllCartItems(cart.id, txn)
    await txn.commit()

    res.sendStatus(200)
  } catch (error) {
    if (txn) await txn.rollback()

    next(error)
  }
};

const orderCartItems = async (req, res, next) => {
  const { addressId } = req.body
  const { userId } = res.locals
  try {
    // txn = await sequelize.transaction({})
    const cart = await cartService.findCartWithItsItemsByUserId(userId)
    const orderItemsList = await orderService.createOrder(userId, addressId, [], cart, next)
    
     res.status(200).send(orderItemsList)
  } catch (error) {

    next(error)
  }
};

module.exports = { getCart, addToCart, deleteFromCart, deleteAllFromCart, orderCartItems };
