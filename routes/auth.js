const router = require('express').Router()
const authController = require("../controllers/auth.js")

router.post("/signin", authController.signin)

module.exports = router