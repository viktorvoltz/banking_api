const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const JWT_SECRETKEY = process.env.JWT_SECRETKEY;
const Admin = require("./../models/admin.js")
const Transaction = require("./../models/transaction.js")
const User = require("./../models/user.js")
const Account = require("./../models/account.js")

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

admin.create_user = async (req, res) => {
    const data = req.body
    const adminId = data.adminId //admin must pass in their special key -- _id

    try {
        const admin = await Admin.findOne({_id: adminId});
        let adminid = '';
        let reqadminid = '';
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
}

admin.delete_user = async (req, res) => {
    const data = req.body
    const adminId = data.adminId //admin must pass in their special key -- _id

    try{
        const admin = await Admin.findOne({_id: adminId});
        let adminid = '';
        let reqadminid = '';
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
}

admin.transfer = async (req, res) => {
    const data = req.body
    const userId = data._id
    const adminId = data.adminId //admin must pass in their special key -- _id

    try{
        const admin = await Admin.findOne({_id: adminId});
        let adminid = '';
        let reqadminid = '';
        adminid += admin._id;
        reqadminid += req.ADMIN_ID;
        if(adminid != reqadminid) return res.status(403).send({message: "you are not ADMIN"})
        const userAcct = await Account.findOne({_id: req.params.otherID})
        const acct = await Account.findOne({_id: userId})
        if(!acct.Acc_isActive) return res.status(400).send({message: "sorry, the account is deactivated"})
        if (!acct) return res.status(400).send({ message: "The account does not exist" })
        if (data.account_balance > userAcct.account_balance) return res.status(400).send({message: "insufficient funds"})

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

}

admin.disable_account = async (req, res) => {
    const data = req.body;
    const adminId = data.adminId; //admin must pass in their special key -- _id
    const isActive = data.Acc_isActive;

    try{
        const admin = await Admin.findOne({_id: adminId});
        let adminid = '';
        let reqadminid = '';
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
}

module.exports = admin