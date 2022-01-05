const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        productName: { type: String, default: "" },
        price: { type: Number, default: 0 },
        // category: { type: String, default: "", index: true },        //Work on this.
        tag: { type: String, default: "", index: true },                //Work on this.
        description: { type: String, default: ""},
        imageUrl : {type : String , default: ""},
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Product", productSchema);