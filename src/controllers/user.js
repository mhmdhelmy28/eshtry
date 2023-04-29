const User = require("../models/user")
const Trader = require("../models/trader")
const Cart = require("../models/cart")
const Role = require("../models/role")
const { ValidationError } = require("sequelize")
const ApiError = require("../utils/ApiError")
const { sequelize } = require("../models/index")
const client = require('../utils/redisClient')()
const logger = require("../utils/logger");
const generateSecretCode = require('../utils/generate')
const sendMail = require('../services/mail')
const signUp = async (req, res, next) => {
  let t = undefined

  try {
    const { firstName, lastName, username, password, email, role } = req.body

    if (
      !firstName ||
      !lastName ||
      !username ||
      !password ||
      !email ||
      !role ||
      (role !== "trader" && role !== "user")
    ) {
      return next(ApiError.badRequest("Please provide all required fields"))
    }
    t = await sequelize.transaction()
    const user = await User.findOne({ where: { username: username } }, { transaction: t })

    if (user) {
      return next(ApiError.badRequest("This username is taken, please choose another one"))
    }

    const newUser = await User.create(
      {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
      },
      { transaction: t }
    )

    if (role === "user") {
      const roleObj = await Role.findOne({ where: { name: role } }, { transaction: t })

      if (!roleObj) {
        await t.rollback()
        return next(ApiError.internal("Error finding roles"))
      }

      await newUser.setRole(roleObj, { transaction: t })

      await Cart.create({ UserId: newUser.id }, { transaction: t })

      
      const secretCode = generateSecretCode()
      await (await client).set(username, secretCode, 600)
      
      await sendMail(email, secretCode, username, (err) => logger.error(err))
      await t.commit()
      return res.status(201).send({ user: newUser })
    } else if (role === "trader") {
      const { storeName } = req.body
      if (!storeName) {
        await t.rollback()
        return next(ApiError.badRequest("store name is required"))
      }

      const roleObj = await Role.findOne({ where: { name: role } }, { transaction: t })

      if (!roleObj) {
        await t.rollback()
        return next(ApiError.internal("Error finding roles"))
      }

      await newUser.setRole(roleObj, { transaction: t })

      const trader = await Trader.create(
        { UserId: newUser.id, storeName: storeName },
        { transaction: t }
      )

      await t.commit()
      return res.status(201).send({
        newUser,
        trader,
      })
    } else {
      await t.rollback()
      return next(ApiError.badRequest("Invalid input"))
    }
  } catch (error) {
    await t.rollback()

    if (error instanceof ValidationError) {
      return res.status(400).send({ error: error.errors[0].message })
    }

    next(error)
  }
}

const verifyEmail = async(req, res, next) => {
  const {username, secretCode} = req.query;
  const actualSecretCode = await (await client).get(username)
  try{
  if(actualSecretCode != null && secretCode !== actualSecretCode){
    return res.status(400).send({message: "Invalid verification request"})
  }
  
  await (await client).del(username)
  const user = await User.findOne({ where: { username: username } })
  if(user){
    user.isVerified = true
    user.save()
    return res.status(200).send({message: "Email verified successfully"})
  }
  return res.status(400).send({message: "Invalid verification request"})
  
}  
catch(error){
  next(error)
}
}

const signIn = async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return next(ApiError.badRequest("Missing username or password."))
    }
    const user = await User.findOne({ where: { username: username } })
    if (!user) {
      return next(ApiError.unauthorized("Incorrect username or password."))
    }
    if (!user.isCorrectPassword(password)) {
      return next(ApiError.unauthorized("Incorrect username or password."))
    } else {
      const accessToken = user.generateAccessToken(username)
      const refreshToken = user.generateRefreshToken(username)
      return res.status(200).send({
        accessToken: `${accessToken}`,
        refreshToken: `${refreshToken}`,
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { signUp, signIn, verifyEmail }
