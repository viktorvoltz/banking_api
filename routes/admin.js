const router = require('express').Router()
const adminAuth = require("./../middleware/adminAuth.js")
const AdminController = require("./../controllers/admin.js")

router.post("/signup", AdminController.signup)
router.post("/signin", AdminController.signin)
router.post("/create-user", adminAuth(), AdminController.create_user)
router.delete("/delete-user/:userId", adminAuth(), AdminController.delete_user)
router.patch("/transfer/:otherID", adminAuth(), AdminController.transfer)


module.exports = router