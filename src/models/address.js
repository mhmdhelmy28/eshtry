const { Model, DataTypes } = require("sequelize");

class Address extends Model {
    static init(sequelize) {
        super.init(
            {
                city: {
                    type: DataTypes.STRING,
                },
                street: {
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
        this.belongsTo(User);
    }
}

module.exports = Address;
