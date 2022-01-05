const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Cart_item_Schema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product" , default: null },
        quantity: { type: String, default : ""},
        // total: { type: Number, default: 0},
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Cart_Item", Cart_item_Schema);