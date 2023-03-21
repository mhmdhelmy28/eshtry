const { createOrder, getOrderById, getUserOrders } = require("../controllers/order");
const router = require("express").Router();
router.post("", createOrder);
router.get("", getUserOrders);
router.get("/:id", getOrderById);
module.exports = router;
