const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class User extends Model {
    static init(sequelize) {
        super.init(
            {
                firstName: {
                    type: DataTypes.STRING,
                },
                lastName: {
                    type: DataTypes.STRING,
                },
                username: {
                    type: DataTypes.STRING,
                },
                password: {
                    type: DataTypes.STRING,
                    validate: {
                        len: [8, 100],
                        isComplex(value) {
                            if (
                                !/[a-z]/.test(value) ||
                                !/[A-Z]/.test(value) ||
                                !/[0-9]/.test(value) ||
                                !/[^a-zA-Z0-9]/.test(value)
                            ) {
                                throw new Error(
                                    "Password must have at least one lowercase letter, one uppercase letter, one number, and one special character."
                                );
                            }
                        },
                    },
                },
            },
            {
                hooks: {
                    async beforeCreate(user, options) {
                        const hashedPassword = await bcrypt.hash(user.password, 10);
                        user.password = hashedPassword;
                    },
                },
                sequelize,
                createdAt: true,
                updatedAt: true,
            }
        );
    }

    static setAssociations() {
        const Order = this.sequelize.models.Order;
        const Address = this.sequelize.models.Address;
        const Review = this.sequelize.models.Review;
        const Role = this.sequelize.models.Role;

        User.belongsTo(Role);
        this.hasMany(Order, { onDelete: "CASCADE" });
        this.hasMany(Address, { onDelete: "CASCADE" });
        this.hasMany(Review, { onDelete: "CASCADE" });
    }
}
User.prototype.isCorrectPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this.id,
            username: this.get("username"),
        },
        process.env.JWT_ACCESS,
        { expiresIn: 360000 }
    );
};
User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        {
            userId: this.id,
            username: this.get("username"),
        },
        process.env.JWT_REFRESH,
        { expiresIn: 360000 }
    );
};

module.exports = User;
