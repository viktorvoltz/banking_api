const mongoose = require('mongoose');
const Schema = mongoose.Schema

const accountSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "user_Acc",
        required: true,
        unique: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    account_name: {
        type: String,
        required: true
    },
    account_pin: {
        type: Number,
        length: 4,
        required: true
    },
    account_balance: {
        type: Number,
        required: true
    },
    Acc_isActive: {
        type: Boolean,
        require: true
    }
})

module.exports= mongoose.model("account", accountSchema);