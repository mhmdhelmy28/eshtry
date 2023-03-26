const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const { sequelize } = require("../models/index");
const Product = require("../models/product");
const ApiError = require("../utils/ApiError");

const createOrder = async (req, res, next) => {
  const { addressId } = req.body;
  const { cartItems } = req.body;
  const { userId } = res.locals;
  let txn = undefined;
  if (!addressId || !cartItems || cartItems.length === 0)
    return next(ApiError.badRequest("Address and cartItems are both required."));
  try {
    txn = await sequelize.transaction({});
    const order = await Order.create(
      { UserId: userId, AddressId: addressId },
      { transaction: txn }
    );
    let totalPrice = 0;
    const orderItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.id);
        if (!product) {
          await txn.rollback();
          return next(ApiError.badRequest("Some cartItems ids are invalid"));
        }
        totalPrice += product.price * cartItem.quantity;
        return new OrderItem({
          quantity: cartItem.quantity,
          OrderId: order.id,
          price: product.price * cartItem.quantity,
          ProductId: product.id,
        }).save({ transaction: txn });
      })
    );

    order.totalPrice = totalPrice;
    await order.save({ transaction: txn });
    await txn.commit();

    res.status(201).send(orderItems);
  } catch (error) {
    if (txn) await txn.rollback();
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { userId } = res.locals;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { id: orderId, UserId: userId },
      include: { model: OrderItem },
    });

    if (order) {
      res.status(200).send(order);
    } else {
      return next(ApiError.notFound("Order not found"));
    }
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = res.locals;
    const orders = await Order.findAll({ where: { UserId: userId } });
    res.status(200).send(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrderById, getUserOrders };
