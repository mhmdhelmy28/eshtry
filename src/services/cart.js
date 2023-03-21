const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");

const emptyCart = async(req, res) => {
    const userId = res.locals.userId;
    await Cart.findOne({ where: { UserId: userId } }).then(
        async (cart) =>
            await CartItem.findAll({ where: { CartId: cart.id } })
                .then(
                    async (items) =>
                        await CartItem.destroy({ where: { id: [items.map((i) => i.id)] } })
                            .then(() => res.sendStatus(200))
                            .catch((err) => res.status(500).send(err))
                )
                .catch((err) => res.status(500).send(err))
    );
}

module.exports = emptyCart;