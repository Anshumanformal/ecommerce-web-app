const mongoose = require('mongoose');
global.objectID = mongoose.Types.ObjectId;

// const url = `${process.env.MONGODB_URL}`;
const url = "mongodb://localhost:27017/MERN_Shopping_Cart";
const options =  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};
module.exports.connect = async () =>{
        await mongoose.connect(url,
        options,
        (error) => { error ? console.log('MongoDB connection Error: ', error) : console.log('DB connected')})
};

