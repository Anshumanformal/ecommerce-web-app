const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
    {
        cart_item: [{ type: Schema.Types.ObjectId, ref: "Cart_Item" , default: null }],
        subTotal: { type: Number, default: 0},
        total : {type : Number, default: 0}, //work on this later -> this will include discount, promocodes.
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Cart", cartSchema);