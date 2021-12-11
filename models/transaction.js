const mongoose = require('mongoose');
const Schema = mongoose.Schema

const transactionSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "user_Acc",
            required: true,
        },
        from: {
            type: String,
        },
        to: {
            type: String,
        },
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: {
          createdAt: "created_at",
        }
      }

)

module.exports = mongoose.model("transaction", transactionSchema);