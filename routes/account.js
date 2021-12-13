const router = require('express').Router()
const auth = require("./../middleware/auth.js")
const AccountController = require("./../controllers/account.js")

router.post("/create", auth(), AccountController.create)





module.exports = router