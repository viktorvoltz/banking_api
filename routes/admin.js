const router = require('express').Router()
const adminAuth = require("./../middleware/adminAuth.js")
const AdminController = require("./../controllers/admin.js")

router.post("/signup", AdminController.signup)
router.post("/signin", AdminController.signin)


module.exports = router