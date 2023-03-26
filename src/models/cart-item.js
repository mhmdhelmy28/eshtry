const { Model, DataTypes } = require("sequelize");

class CartItem extends Model {
    static init(sequelize) {
        super.init(
            {
                quantity: {
                    type: DataTypes.INTEGER,
                },
                price: {
                    type: DataTypes.INTEGER,
                },
            },
            {
                sequelize,
                createdAt: true,
                updatedAt: true,
            }
        );
    }
    static setAssociations() {
        const Cart = this.sequelize.models.Cart;
        const Product = this.sequelize.models.Product;
        this.belongsTo(Cart);
        this.belongsTo(Product);
    }
}
module.exports = CartItem;
