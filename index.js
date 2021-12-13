const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config()
const User = require("./models/user.js");

const app = express()
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI

app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

async function connectToMongoDB() {
    await mongoose.connect(MONGODB_URI);
    console.log(":: Connected to MongoDB server")
}

app.get('/ping', (req, res) => {
    res.status(200).send("hello world!");
})

app.use("/auth", require("./routes/auth"))

app.use("/account", require("./routes/account"))


app.post('/transaction-records', async (req, res) => {
    const data = req.body
    const userId = data.userId

    try{
        const user = await User.findOne({_id: userId}).populate('transactions');
        console.log(user.transactions)

        res.status(200).send({message: "Transactions", data: user.transactions});
    }catch(error){
        res.status(400).send({message: "couldn't get transactions", data: error})
        console.log(error)
    }
})

app.use('/admin', require("./routes/admin"))


app.use("**", (req, res) => {
    res.status(404).send({ message: "Route not found" })
  })
  
  app.use((error, req, res, next) => {
    console.log(error)
    res.status(500).send({ message: "Something went wrong", error: error.message })
  })



app.listen(PORT, () => {
    try {
        connectToMongoDB()
    } catch (error) {
        console.log("couldn't connect to database");
    }
    console.log(`:: server listening on https://localhost:${PORT}`)
})