const { Model, DataTypes } = require("sequelize");

class Product extends Model {
    static init(sequelize) {
    
        super.init(
            {
               
                name: {
                    type: DataTypes.STRING,
                },
                description: {
                    type: DataTypes.STRING,
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
        const Review = this.sequelize.models.Review;
        const Trader = this.sequelize.models.Trader;
        const Category = this.sequelize.models.Category;
        this.belongsTo(Category);
        this.belongsTo(Trader);
        this.hasMany(Review);
    }
}

module.exports = Product;
