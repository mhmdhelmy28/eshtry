const addressRouter = require("express").Router();
const {
  createAddress,
  getAddressById,
  getUserAdresses,
  deleteAddressById,
} = require("../controllers/address");

addressRouter.post("", createAddress);
addressRouter.get("/:id", getAddressById);
addressRouter.get("", getUserAdresses);
addressRouter.delete("/:id", deleteAddressById);

module.exports = addressRouter;
