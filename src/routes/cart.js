const { getCart, addToCart, deleteFromCart, deleteAllFromCart, orderCartItems } = require("../controllers/cart");
const router = require("express").Router();

router.get("", getCart);
router.post("", addToCart);
router.delete("/:id", deleteFromCart);
router.delete("", deleteAllFromCart);
router.post('/order', orderCartItems);
module.exports = router;
