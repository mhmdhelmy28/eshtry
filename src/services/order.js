const Product = require("../models/product");
const { sequelize } = require("../models/index");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const CartService = require('./cart');
const cartService = new CartService()
class OrderService {
  async createOrder(userId, addressId, cartItems, cart, next){
    let txn = undefined
    
    try {
      
      if(cart !== null) cartItems = cart.CartItems
      txn = await sequelize.transaction({})
      const order = await Order.create(
        { UserId: userId, AddressId: addressId },
        { transaction: txn }
      );
      let totalPrice = 0;
      const orderItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          let productId = cartItem.id
          if(cart !== null) productId = cartItem.ProductId 
          const product = await Product.findByPk(productId)
          if (!product) {
            await txn.rollback();
            return next(ApiError.badRequest("Some cartItems ids are invalid"))
          }
          totalPrice += product.price * cartItem.quantity;
          return new OrderItem({
            quantity: cartItem.quantity,
            OrderId: order.id,
            price: product.price * cartItem.quantity,
            ProductId: product.id,
          }).save({ transaction: txn })
        })
      );
  
      order.totalPrice = totalPrice
      await order.save({ transaction: txn })
      if (cart !== null) {
         await cartService.deleteAllCartItems(cart.id, txn)
      }
      await txn.commit()
      return orderItems
    }catch(error){
      console.log(error)
      if (txn ) await txn.rollback();
      next(error)
    }  
  }

  async getOrderById(orderId, userId){
    return await Order.findOne({
      where: { id: orderId, UserId: userId },
      include: { model: OrderItem },
    });
  }

  async getUserOrders(userId){
    return await Order.findAll({ where: { UserId: userId } });
  }
}
module.exports = OrderService;
