const { Model, DataTypes } = require("sequelize");

class Category extends Model {
    static init(sequelize) {
        super.init(
            {
                name: {
                    type: DataTypes.STRING,
                },
                description: {
                    type: DataTypes.STRING,
                },
            },
            {
                sequelize,
                timestamps: false
            }
        );
    }
    static setAssociations() {
        const Product = this.sequelize.models.Product;
        this.hasMany(Product);
    }
}

module.exports = Category;
