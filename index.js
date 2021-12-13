const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const User = require("./models/user.js");
const Account = require("./models/account.js");
const Transaction = require("./models/transaction.js");
const Admin = require("./models/admin.js");
const auth = require('./middleware/auth.js');
const adminAuth = require("./middleware/adminAuth.js");
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

app.use("/auth", require("./routes/auth"))

app.use("/account", require("./routes/account"))

app.patch('/account/withdraw/:_id', auth(), async (req, res) => {
    const data = req.body

    try {
        const acct = await Account.findOne({_id: req.params._id})
        acctuserid = '';   //for some reason javascript wouldn't check two alphanumeric, so i had to stringify my token and id
        requserid = '';
        acctuserid += acct.userId;
        requserid += req.USER_ID;
        if (acctuserid != requserid) return res.status(403).send({ message: "You can't withdraw from this account" });
        if(!acct.Acc_isActive) return res.status(400).send({message: "account is deactivated"})
        if (!acct) return res.status(400).send({ message: "user account does not exist" })

        const withdrawTransaction = await new Transaction({
            user_id: acct.userId,
            type: "Withdraw",
            amount: data.account_balance,
        }).save()

        const user = await User.findOne({_id: acct.userId}).populate('transactions');
        console.log(user.transactions)

        const newBalance = await Account.findByIdAndUpdate(req.params._id,
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

app.patch('/account/transfer/:otherID', auth(), async (req, res) => {
    const data = req.body
    const userId = data._id

    try{
        const userAcct = await Account.findOne({_id: req.params.otherID})
        acctuserid = '';   //for some reason javascript wouldn't check two alphanumeric, so i had to stringify my token and id
        requserid = '';
        acctuserid += userAcct.userId;
        requserid += req.USER_ID;
        if (acctuserid != requserid) return res.status(403).send({ message: "You can't transfer from this account" });
        const acct = await Account.findOne({_id: userId})
        if(!acct.Acc_isActive) return res.status(400).send({message: "sorry, the account is deactivated"})
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

app.post('/admin/signup', async (req, res) => {
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
})

app.post('/admin/signin', async (req, res) => {
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
})

app.post('/admin/create-user', adminAuth(), async (req, res) => {
    const data = req.body
    const adminId = data.adminId //admin must pass in their special key -- _id

    try {
        const admin = await Admin.findOne({_id: adminId});
        adminid = '';
        reqadminid = '';
        adminid += admin._id;
        reqadminid += req.ADMIN_ID;
        if(adminid != reqadminid) return res.status(403).send({message: "you are not ADMIN"})
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await new User({
            email: data.email,
            password: hashedPassword,
            full_name: data.full_name,
            isAdmin: false
        }).save()

        const token = jwt.sign({ userId: user._id, }, JWT_SECRETKEY)

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

app.delete('/admin/delete-user/:userId', adminAuth(), async (req, res) => {
    const data = req.body
    const adminId = data.adminId //admin must pass in their special key -- _id

    try{
        const admin = await Admin.findOne({_id: adminId});
        adminid = '';
        reqadminid = '';
        adminid += admin._id;
        reqadminid += req.ADMIN_ID;
        if(adminid != reqadminid) return res.status(403).send({message: "you are not ADMIN"})
        const user = await User.findOne({_id: req.params.userId});
        if(!user) return res.status(403).send({message: "user does not exist"});
        await User.findByIdAndDelete(req.params.userId);

        res.status(200).send({message: "user has been deleted", data: user});
    }catch(error){
        res.status(400).send({message: "user was not deleter", data: error});
        console.log(error)
    }
})

app.patch('/admin/transfer/:otherID', adminAuth(), async (req, res) => {
    const data = req.body
    const userId = data._id
    const adminId = data.adminId //admin must pass in their special key -- _id

    try{
        const admin = await Admin.findOne({_id: adminId});
        adminid = '';
        reqadminid = '';
        adminid += admin._id;
        reqadminid += req.ADMIN_ID;
        if(adminid != reqadminid) return res.status(403).send({message: "you are not ADMIN"})
        const userAcct = await Account.findOne({_id: req.params.otherID})
        const acct = await Account.findOne({_id: userId})
        if(!acct.Acc_isActive) return res.status(400).send({message: "sorry, the account is deactivated"})
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

app.patch('/admin/disable-account/:id', adminAuth(), async (req, res) => {
    const data = req.body;
    const adminId = data.adminID; //admin must pass in their special key -- _id
    const isActive = data.Acc_isActive;

    try{
        const admin = await Admin.findOne({_id: adminId});
        adminid = '';
        reqadminid = '';
        adminid += admin._id;
        reqadminid += req.ADMIN_ID;
        if(adminid != reqadminid) return res.status(403).send({message: "you are not ADMIN"})
        const account = await Account.findOne({_id: req.params.id})
        if(!account) return res.status(400).send({message: "account does not exist"})

        const activeness = await Account.findByIdAndUpdate(req.params.id,
            {
                $set: {
                    Acc_isActive: isActive
                }
            },
            { new: true }
        )
        
        res.status(200).send({message: "Activeness has been changed", data: activeness})
    }catch(error){
        res.status(400).send({message: "couldnt change activeness", data: error})
        console.log(error)
    }
})

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