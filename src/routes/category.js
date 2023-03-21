const router = require("express").Router();
const { createCategory, getAllCategories } = require("../controllers/category");
const isAdmin = require('../middlewares/isAdmin.js');
router.post("", isAdmin,createCategory);
router.get("", getAllCategories);

module.exports = router;
