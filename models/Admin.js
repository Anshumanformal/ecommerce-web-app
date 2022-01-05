const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const DocSchema = new Schema(
    {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        username: { type: String, default: "" },
        email: { type: String, default: "", index: true },
        password: { type: String, default: "", index: true },
        image : {type : String , default: ""},
        // isNewUser: { type: Boolean, default: true },
        // isEmailVerified: { type: Boolean, default: false },
        accessToken: { type: String, default: ""},
        isDeleted: { type: Boolean, default: false },
        // oneTimeCode: { type: String, default: "" },
    },
    { timestamps: true }
)

DocSchema.index({ email: 1 }, { unique: true });

DocSchema.methods.authenticate = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("MISSING_PASSWORD"));

        bcrypt.compare(password, this.password, (error, result) => {
            if (!result) reject(new Error("INVALID_PASSWORD"));
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

DocSchema.methods.setPassword = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("Missing Password"));

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            this.password = hash;
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

module.exports = mongoose.model('Admin', DocSchema);