const Account = require("./../models/account.js")

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

module.exports = account