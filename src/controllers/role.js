const Role = require("../models/role");

const createRole = async (req, res, next) => {
  try {
    const { name } = req.body

    const role = await Role.create({
      name,
    });

    res.status(201).send({
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = createRole;
