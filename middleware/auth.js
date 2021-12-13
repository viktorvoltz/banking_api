const jwt = require("jsonwebtoken")
const User = require("./../models/user.js")

module.exports = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization
      if (!token) throw new Error("Token not found")
      const decoded = jwt.decode(token)

      const user = await User.findById(decoded.userId)
      if (!user) throw new Error("Unauthorized user")
      //console.log(`user ${user}`);

      req.USER_ID = user._id

      next()
    } catch (error) {
      next(error)
    }
  }
}