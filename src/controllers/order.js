const ApiError = require("../utils/ApiError");
const OrderService = require('../services/order');
const orderService = new OrderService()
const createOrder = async (req, res, next) => {
  const { addressId } = req.body
  const { cartItems } = req.body
  const { userId } = res.locals
  if (!addressId || !cartItems || cartItems.length === 0)
    return next(ApiError.badRequest("Address and cartItems are both required."))
  try {
    const orderItems = await orderService.createOrder(userId, addressId, cartItems,null, next)

    res.status(201).send(orderItems)
  } catch (error) {
    next(error)
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { userId } = res.locals
    const orderId = req.params.id

    const order = await orderService.getOrderById(orderId, userId)

    if (order) {
      res.status(200).send(order)
    } else {
      return next(ApiError.notFound("Order not found"))
    }
  } catch (error) {
    next(error)
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = res.locals
    const orders = await orderService.getUserOrders(userId)
    res.status(200).send(orders)
  } catch (error) {
    next(error)
  }
};

module.exports = { createOrder, getOrderById, getUserOrders };
