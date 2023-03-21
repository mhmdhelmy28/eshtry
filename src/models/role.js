const { Model, DataTypes } = require("sequelize");


class Role extends Model {
    static init(sequelize) {
        super.init(
            {
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                }
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
        Role.hasMany(User);
    }
}

module.exports = Role;