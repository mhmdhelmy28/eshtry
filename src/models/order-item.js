const { Model, DataTypes } = require("sequelize");

class OrderItem extends Model {
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
        const Order = this.sequelize.models.Order;
        const Product = this.sequelize.models.Product;
        this.belongsTo(Order);
        this.belongsTo(Product);
    }
}

module.exports = OrderItem;
