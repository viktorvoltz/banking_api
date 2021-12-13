const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const JWT_SECRETKEY = "jhvcjhdbvjbadjkfbvjhdjbhjhjbjkbjhbhj";
const Admin = require("./../models/admin.js")
const Transaction = require("./../models/transaction.js")
const User = require("./../models/user.js")

const admin = {}

admin.signup = async (req, res) => {
    const data = req.body

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const admin = await new Admin({
            email: data.email,
            password: hashedPassword,
            isAdmin: true
        }).save()

        const token = jwt.sign({ admin_id: admin._id, }, JWT_SECRETKEY)

        res.status(201).send({
            message: "ADMIN created successfully",
            data: {
                token,
                email: admin.email,
                admin_id: admin._id,
            }
        })
    } catch (error) {
        res.status(400).send({ message: "ADMIN was not created", data: error })
        console.log(error)
    }
}

admin.signin = async (req, res) => {
    const data = req.body

    try {
        const admin = await Admin.findOne({ email: data.email })
        if (!admin) return res.status(400).send({ message: "Invalid email or password" })
        const isValidPassword = await bcrypt.compare(data.password, admin.password)
        if (!isValidPassword) return res.status(400).send({ message: "Invalid email or password" })
    
        const token = jwt.sign({ admin_id: admin._id }, JWT_SECRETKEY)
    
        res.status(200).send({
          message: "ADMIN LOGIN",
          data: {
            token,
            admin_id: admin._id,
            email: admin.email,
          }
        })
      } catch (error) {
        console.log(error)
        res.status(400).send({ message: "Unable to signin as Admin", error })
      }
}


module.exports = admin