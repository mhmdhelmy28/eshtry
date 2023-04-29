const { signUp, signIn, verifyEmail } = require("../controllers/user");
const router = require("express").Router();
router.post("/signUp", signUp);
router.get("/verify", verifyEmail);
router.post("/signIn", signIn);

module.exports = router;
