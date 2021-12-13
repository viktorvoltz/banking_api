const router = require('express').Router()
const adminAuth = require("./../middleware/adminAuth.js")
const AdminController = require("./../controllers/admin.js")

router.post("/signup", AdminController.signup)
router.post("/signin", AdminController.signin)
router.post("/create-user", adminAuth(), AdminController.create_user)


module.exports = router