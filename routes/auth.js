const router = require('express').Router()
const authController = require("./../controllers/authController.js")

router.post("/signin", authController.signin)

module.exports = router