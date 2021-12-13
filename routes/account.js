const router = require('express').Router()
const auth = require("./../middleware/auth.js")
const AccountController = require("./../controllers/account.js")

router.post("/create", auth(), AccountController.create)
router.patch("/deposit/:_id", auth(), AccountController.deposit)
router.patch("/withdraw/:_id", auth(), AccountController.withdraw)



module.exports = router