const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

const isAdmin = async (req, res, next) => {

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ message: "user not authorized" });
  }
  console.log(authorization);
  const token = authorization.split(" ")[1];
  const { userId } = jwt.verify(token, process.env.JWT_ACCESS);
  const user = await User.findByPk(userId);
  const userRole = await user.getRole();
  
  const roleName = userRole.name;
  if (roleName && roleName === 'trader') {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Only traders can access this endpoint" });
  }
};

module.exports = isAdmin;