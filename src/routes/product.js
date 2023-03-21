const router = require("express").Router();
const {
  createProduct,
  getProductById,
  getProductsByCategory,
  getProducts,
} = require("../controllers/product");
const isTrader = require('../middlewares/isTrader');
const isAuthenticated = require('../middlewares/auth_middleware')
router.post("", isAuthenticated, isTrader,createProduct);
router.get("/:id", getProductById);
router.get("/byCategory/:categoryId", getProductsByCategory);
router.get('', getProducts);
module.exports = router;
