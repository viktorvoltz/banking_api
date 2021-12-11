const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

userSchema.virtual('transactions', {
    ref: 'transaction', 
    localField: '_id',
    foreignField: 'user_id'
})

module.exports= mongoose.model("user_Acc", userSchema);