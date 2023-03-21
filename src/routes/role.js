const express = require('express');
const router = express.Router();
const createRole = require('../controllers/role');
const isAdmin = require('../middlewares/isAdmin');

router.post('/', isAdmin, createRole);

module.exports = router;