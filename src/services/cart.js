const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
class CartService {

async createCartItem(cartId, productId, productPrice, quantity){
    return await CartItem.create({
        CartId: cartId,
        ProductId: productId,
        quantity: quantity,
        price: productPrice * quantity,
      });
}
async  findCartWithItsItemsByUserId(userId){
    const cart = await Cart.findOne({ where: { UserId: userId }, include: { model: CartItem } });
    return cart;
}
async  findCartByUserId(userId){
    const cart = await Cart.findOne({ where: { UserId: userId }});
    return cart;
}

async findCartItemById(cartItemId){
   return await CartItem.findOne({ where: { id: cartItemId} })
}

async deleteAllCartItems (cartId, transaction)  {
    return await CartItem.destroy({ where: { CartId: cartId }, transaction });
  }

async  findCartItem(cartItemId){
    const cartItem = CartItem.findOne({ where: { id: cartItemId} });
    return cartItem
}


}
module.exports = CartService;