const router = require('express').Router()
const auth = require("./../middleware/auth.js")
const AccountController = require("./../controllers/account.js")

router.post("/create", auth(), AccountController.create)
router.patch("/deposit/:_id", auth(), AccountController.deposit)




module.exports = router