const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const User = require("./models/user.js");
const Account = require("./models/account.js");
const Transaction = require("./models/transaction.js");
const JWT_SECRETKEY = "jhvcjhdbvjbadjkfbvjhdjbhjhjbjkbjhbhj";

const app = express()
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

async function connectToMongoDB() {
    await mongoose.connect('mongodb://localhost:27017/bank');
    console.log(":: Connected to MongoDB server")
}

app.get('/ping', (req, res) => {
    res.status(200).send("hello world!");
})

app.post('/auth/signup', async (req, res) => {
    const data = req.body

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await new User({
            email: data.email,
            password: hashedPassword,
            full_name: data.full_name,
            isAdmin: false
        }).save()

        const token = jwt.sign({ user_id: user._id, }, JWT_SECRETKEY)

        res.status(201).send({
            message: "created user successfully",
            data: {
                token,
                email: user.email,
                full_name: user.full_name,
                user_id: user._id,
            }
        })
    } catch (error) {
        res.status(400).send({ message: "user was not created", data: error })
        console.log(error)
    }
})


app.post('/account/create', async (req, res) => {

    const generateRandomString = (stringLength) => {
        //stringLength = 10;
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz';
        var str = '';
        for (i = 0; i < stringLength; i++) {
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomChar;
        }
        return str;
    }
    const data = req.body

    try {
        const account = await new Account({
            userId: data.userId,
            account_number: generateRandomString(10),
            account_name: data.account_name,
            account_pin: data.account_pin,
            account_balance: 0,
            Acc_isActive: true
        }).save()

        res.status(201).send({ message: "acount created", data: account })
    } catch (error) {
        res.status(400).send({ message: "account not created", data: error })
    }

})

app.patch('/accont/deposit', async (req, res) => {
    const data = req.body
    const userId = data.userId

    try {
        //const user = await User.findOne({_id: userId})
        const acct = await Account.findById(userId)
        if(!acct.Acc_isActive) return res.status(400).send({message: "account is deactivated"})
        if (!acct) return res.status(400).send({ message: "user account does not exist" })

        const depositTransaction = await new Transaction({
            user_id: acct.userId,
            type: "Deposit",
            amount: data.account_balance,
        }).save()

        //const transaction = await Transaction.findOne({user_id: acct.userId});

        const user = await User.findOne({_id: acct.userId}).populate('transactions');
        console.log(user.transactions)

        const newBalance = await Account.findByIdAndUpdate(userId,
            {
                $set: {
                    account_balance: acct.account_balance += data.account_balance
                }
            },
            { new: true }
        )
        res.status(200).send({ message: "deposit recieved", data: {newBalance, user} })
    } catch (error) {
        res.status(400).send({ message: "couldn't deposit", error })
        console.log(error)
    }
})

app.patch('/accont/withdraw', async (req, res) => {
    const data = req.body
    const userId = data.userId

    try {
        const acct = await Account.findById(userId)
        if(!acct.Acc_isActive) return res.status(400).send({message: "account is deactivated"})
        if (!acct) return res.status(400).send({ message: "user account does not exist" })

        const withdrawTransaction = await new Transaction({
            user_id: acct.userId,
            type: "Withdraw",
            amount: data.account_balance,
        }).save()

        const user = await User.findOne({_id: acct.userId}).populate('transactions');
        console.log(user.transactions)

        const newBalance = await Account.findByIdAndUpdate(userId,
            {
                $set: {
                    account_balance: acct.account_balance -= data.account_balance
                }
            },
            { new: true }
        )
        res.status(200).send({ message: "debit: money withdrawn", data: {newBalance, user}})
    } catch (error) {
        res.status(400).send({ message: "couldn't deposit", error })
    }
})

app.patch('/account/transfer/:otherID', async (req, res) => {
    const data = req.body
    const userId = data._id

    try{
        const userAcct = await Account.findOne({_id: req.params.otherID})
        const acct = await Account.findOne({_id: userId})
        if(!acct.Acc_isActive) return res.status(400).send({message: "soryy, the account is deactivated"})
        if (!acct) return res.status(400).send({ message: "The account does not exist" })

        const transferTransaction = await new Transaction({
            user_id: userAcct.userId,
            from: `you -${req.params.otherID}`,
            to: userId,
            type: "Transfer",
            amount: data.account_balance,
        }).save()

        const user = await User.findOne({_id: userAcct.userId}).populate('transactions');
        console.log(user.transactions)

        //userAcct.account_balance -=  data.account_balance;


        const newUserBalance = await Account.findByIdAndUpdate(req.params.otherID, 
            {
                $set: {
                    account_balance: userAcct.account_balance -= data.account_balance
                }
            },
            {new: true}
            )

        const newBalance = await Account.findByIdAndUpdate(userId,
            {
                $set: {
                    account_balance: acct.account_balance += data.account_balance
                }
            },
            { new: true }
        )
        res.status(200).send({ message: "transfer: money sent!", data: {newBalance },})
    }catch(error){
        res.status(400).send({ message: "couldn't transfer", data: error })
        console.log(error)
    }

})

app.post('/transaction-records', async (req, res) => {
    const data = req.body
    const userId = data._id

    try{
        const user = await User.findOne({_id: userId}).populate('transactions');
        console.log(user.transactions)

        res.status(200).send({message: "Transactions", data: user.transactions});
    }catch(error){
        res.status(400).send({message: "couldn't get transactions", data: error})
        console.log(error)
    }
})




app.listen(PORT, () => {
    try {
        connectToMongoDB()
    } catch (error) {
        console.log("couldn't connect to database");
    }
    console.log(`:: server listening on https://localhost:${PORT}`)
})