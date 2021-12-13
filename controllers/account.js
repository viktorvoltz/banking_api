const Account = require("./../models/account.js")
const Transaction = require("./../models/transaction.js")
const User = require("./../models/user.js")

const account = {};

account.create = async (req, res) => {

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
            userId: req.USER_ID,
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

}

account.deposit = async (req, res) => {
    const data = req.body

    try {
        const acct = await Account.findOne({_id: req.params._id})
        acctuserid = '';   //for some reason javascript wouldn't check two alphanumeric, so i had to stringify my token and id
        requserid = '';
        acctuserid += acct.userId;
        requserid += req.USER_ID;
        if (acctuserid != requserid) return res.status(403).send({ message: "You can't deposit to this account" });
        if(!acct.Acc_isActive) return res.status(400).send({message: "account is deactivated"});
        if (!acct) return res.status(400).send({ message: "user account does not exist" });

        const depositTransaction = await new Transaction({
            user_id: acct.userId,
            type: "Deposit",
            amount: data.account_balance,
        }).save()

        //const transaction = await Transaction.findOne({user_id: acct.userId});

        const user = await User.findOne({_id: acct.userId}).populate('transactions');
        console.log(user.transactions)

        const newBalance = await Account.findByIdAndUpdate(req.params._id,
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
}

account.withdraw = async (req, res) => {
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
}

account.transfer = async (req, res) => {
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

}

module.exports = account