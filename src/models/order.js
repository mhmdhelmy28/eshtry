const { Model, DataTypes } = require("sequelize");

class Order extends Model {
    static init(sequelize) {
        super.init(
            {
                totalPrice: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
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
        const User = this.sequelize.models.User;
        const Address = this.sequelize.models.Address;
        const OrderItem = this.sequelize.models.OrderItem;
        this.belongsTo(Address);
        this.belongsTo(User);
        this.hasMany(OrderItem);
    }
}

module.exports = Order;
