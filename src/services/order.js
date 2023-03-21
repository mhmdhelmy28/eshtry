const { connectDatabase } = require("../models/init");
const Product = require("../models/product");
const sequelize = require("sequelize");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");

const proceedToOrder = async (req, res) => {
    const addressId = req.body.addressId;
    const userId = res.locals.userId;
    const Sequelize = connectDatabase("dbFile.db");
    let txn = undefined;
    try {
      txn = await Sequelize.transaction({});
      const order = await Order.create({ UserId: userId, AddressId: addressId }, { transaction: txn });
      const cartItems = req.body.cartItems;
      const products = await Product.findAll({
        where: {
          id: {
            [sequelize.Op.in]: cartItems.map((item) => item.id),
          },
        },
      });
      const orderItems = await Promise.all(products.map(async (product) => {
        return new OrderItem({
          quantity: product.quantity,
          OrderId: order.id,
          price: product.price,
          productId: product.id,
        }).save({ transaction: txn });
      }));
      await txn.commit();
      res.status(200).send(orderItems);
    } catch (err) {
      if (txn) await txn.rollback();
      res.status(500).send({ error: err.message });
    }
  };

module.exports = proceedToOrder;
