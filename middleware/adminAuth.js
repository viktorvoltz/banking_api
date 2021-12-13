const jwt = require("jsonwebtoken")
const Admin = require("./../models/admin.js")

module.exports = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization
      if (!token) throw new Error("Token not found")
      const decoded = jwt.decode(token)

      const admin = await Admin.findById(decoded.admin_id)
      if (!admin) throw new Error("Unauthorized user")

      req.ADMIN_ID = admin._id

      next()
    } catch (error) {
      next(error)
    }
  }
}