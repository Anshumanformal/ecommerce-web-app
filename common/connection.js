const mongoose = require("mongoose");
global.ObjectId = mongoose.Types.ObjectId;

const functions = require("../common/functions");
const Model = require("../models");

module.exports.mongodb = async () => {
    await mongoose.connect(
        process.env.MONGODB_URL,
        {
            useUnifiedTopology: true,
            // useFindAndModify: false,
            useNewUrlParser: true,
            // useCreateIndex: true,
        },
        (error, result) => {
            error ? console.error("Mongo", error) : console.log("Mongo Connected");
        }
    );

    // const docs = await Model.Settings.find().lean();
    // global.appSettings = functions.toObject(docs, "key", "value");
};
