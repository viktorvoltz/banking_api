const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/user.js")
const JWT_SECRETKEY = "jhvcjhdbvjbadjkfbvjhdjbhjhjbjkbjhbhj";

const auth = {}

auth.signin = async(req, res) => {
    const data = req.body

    try {
        const user = await User.findOne({ email: data.email })
        if (!user) return res.status(400).send({ message: "Invalid email or password" })
        const isValidPassword = await bcrypt.compare(data.password, user.password)
        if (!isValidPassword) return res.status(400).send({ message: "Invalid email or password" })
    
        const token = jwt.sign({ userId: user._id }, JWT_SECRETKEY)
    
        res.status(200).send({
          message: "Login successful",
          data: {
            token,
            userId: user._id,
            email: user.email,
            full_name: user.full_name
          }
        })
      } catch (error) {
        console.log(error)
        res.status(400).send({ message: "Unable to Login", error })
      }
}


module.exports = auth