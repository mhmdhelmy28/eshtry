const { Model, DataTypes } = require("sequelize");


class Review extends Model {
    static init(sequelize) {
        super.init(
            {
              
                content: {
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
        const User = this.sequelize.models.User;
        const Product = this.sequelize.models.Product;
        this.belongsTo(User);
        this.belongsTo(Product);
    }
}

module.exports = Review;
