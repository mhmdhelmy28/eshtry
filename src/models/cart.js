const { Model, DataTypes } = require("sequelize");
class Cart extends Model {
    static init(sequelize) {
        super.init(
            {},
            {
                sequelize,
                createdAt: true,
                updatedAt: true,
            }
        );
    }
    static setAssociations() {
        const User = this.sequelize.models.User;
        const CartItem = this.sequelize.models.CartItem;
        this.belongsTo(User);
        this.hasMany(CartItem);
    }
}

module.exports = Cart;
