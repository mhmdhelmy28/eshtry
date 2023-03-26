const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const { sequelize } = require("../models/index");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const Product = require("../models/product");
const ApiError = require("../utils/ApiError");
const getCart = async (req, res, next) => {
  const { userId } = res.locals;
  try {
    const cart = await Cart.findOne({ where: { UserId: userId }, include: { model: CartItem } });
    res.status(200).send(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  const { userId } = res.locals;
  const { id, quantity } = req.body;

  if (!id || !quantity) {
    return next(ApiError.badRequest("Please provide all required fields"));
  }

  try {
    const cart = await Cart.findOne({ where: { UserId: userId } });
    const product = await Product.findByPk(id);

    if (!product) {
      return next(ApiError.notFound("Product not found"));
    }

    const item = await CartItem.create({
      CartId: cart.id,
      ProductId: product.id,
      quantity: quantity,
      price: product.price * quantity,
    });

    res.status(201).send(item);
  } catch (error) {
    next(error);
  }
};

const deleteFromCart = async (req, res, next) => {
  const { userId } = res.locals;
  const cartItemId = req.params.id;
  try {
    const cart = await Cart.findOne({ where: { UserId: userId } });
    const item = await CartItem.findOne({ where: { id: cartItemId, CartId: cart.id } });
    if (!item) {
      return next(ApiError.notFound("Item not found in cart"));
    }
    await item.destroy();
    res.status(200).send(item);
  } catch (error) {
    next(error);
  }
};

const deleteAllCartItems = async (cartId, transaction) => {
  await CartItem.destroy({ where: { CartId: cartId }, transaction });
};

const deleteAllFromCart = async (req, res, next) => {
  const { userId } = res.locals;
  let txn = undefined;
  try {
    const cart = await Cart.findOne({ where: { UserId: userId } });
    txn = await sequelize.transaction({});
    await deleteAllCartItems(cart.id, txn);
    await txn.commit();

    res.sendStatus(200);
  } catch (error) {
    if (txn) await txn.rollback();

    next(error);
  }
};

const orderCartItems = async (req, res, next) => {
  const { addressId } = req.body;
  const { userId } = res.locals;
  let txn = undefined;
  try {
    txn = await sequelize.transaction({});
    const cart = await Cart.findOne({ where: { UserId: userId }, include: CartItem });
    const cartItems = cart.CartItems;
    let totalPrice = 0;
    const order = await Order.create(
      { UserId: userId, AddressId: addressId },
      { transaction: txn }
    );
    const orderItemsList = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.ProductId);
        totalPrice += cartItem.price;
        return new OrderItem({
          OrderId: order.id,
          ProductId: product.id,
          quantity: cartItem.quantity,
          price: cartItem.price,
        }).save({ transaction: txn });
      })
    );
    order.totalPrice = totalPrice;
    await order.save({ transaction: txn });
    await deleteAllCartItems(cart.id, txn);
    await txn.commit();
    res.status(200).send(orderItemsList);
  } catch (error) {
    if (txn) await txn.rollback();

    next(error);
  }
};

module.exports = { getCart, addToCart, deleteFromCart, deleteAllFromCart, orderCartItems };
