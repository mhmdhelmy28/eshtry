const { Model, DataTypes } = require("sequelize");

class Trader extends Model {
    static init(sequelize) {
        super.init(
            {
                storeName: {
                    type: DataTypes.STRING,
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
        const Product = this.sequelize.models.Product;
        const User = this.sequelize.models.User;
        this.belongsTo(User);
        this.hasMany(Product);
    }
}

module.exports = Trader;
