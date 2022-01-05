const Model = require("../../models");
const Validation = require("../validations");
const Auth = require("../../common/authenticate");
const Services = require("../../services/index");
const functions = require("../../common/functions");

//Admin is registered once from the below API.

module.exports.register = async (req, res, next) => {
    try {
        await Validation.Admin.register.validateAsync(req.body);

        let admin = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted : false,
        })
        if(admin) res.error(`ADMIN_WITH_THIS_EMAIL_ALREADY_EXISTS`);

        admin = await Model.Admin.create(req.body);

        //Hash the password.
        let admin_with_hashed_password = await admin.setPassword(req.body.password);
        req.body.password = await admin_with_hashed_password.password;

        await admin.save();
        return res.success("ADMIN_REGISTERED_SUCCESSFULLY", admin);

    } catch (error) {
        next(error);
    }
}

module.exports.login = async (req, res, next) => {
    try {
        await Validation.Admin.login.validateAsync(req.body);

        let admin = await Model.Admin.findOne({email : req.body.email});
        if(!admin) res.error("ADMIN_NOT_FOUND");

        await admin.authenticate(req.body.password);

        admin.accessToken = Auth.getToken({
            a_id: admin._id,                // If we change this to u_id, then the admin_id will be searched in the user collection. Hence no result.
        });
        await admin.save();
        res.success("ADMIN_LOGGED_IN_SUCCESSFULLY", admin);


    } catch (error) {
        next(error);
    }
}

module.exports.getAdminData = async (req, res, next) => {
    try {

        let admin = await Model.Admin.findOne({email : req.body.email}, {accessToken : 0});

        res.success("ADMIN_DATA_FETCHED", admin);
    } catch (error) {
        next(error);
    }
}

module.exports.uploadImage = async (req, res, next) => {
    try {
        res.success("INSIDE_UPLOAD_IMAGE");
    } catch (error) {
        next(error);
    }
}

module.exports.getAllUser = async (req, res, next) => {
    try {

        let page = req.query.page ? Number(req.query.page) : 1;
        let count = req.query.count ? Number(req.query.count) : 10;
        let skipNo = Number((page - 1) * count);
        let sort = { createdAt: -1 };

        let query = { isDeleted: false};
        let active_key = {
            email : 1,
            password : 1,
            accessToken : 1
        }
        //Or we can write.
        // let active_key = 'email password accessToken';

        let doc = await Model.User.find(query).sort(sort).limit(count).skip(skipNo).select(active_key);
        const itemCount = await Model.User.find(query).countDocuments(query);
        let sendObj = { itemCount, doc };

        return res.success("USER_DATA_FETCHED", sendObj);

    } catch (error) {
        next(error);
    }
}

module.exports.deleteOneUser = async (req, res, next) => {
    try {
        const filter = { _id: req.params.userId };
        const update = {isDeleted : true}
        const options = {
            new: true,
        };

        //Checking if the user was already deleted.
        let userDel = await Model.User.findOne({_id : req.params.userId});
        if(userDel.isDeleted == true) return res.error("USER_ALREADY_DELETED");

        let doc = await Model.User.findOneAndUpdate(filter, update, options);

        return res.success("USER_SOFT_DELETED_SUCCESSFULLY", doc);

    } catch (error) {
        next(error);
    }
}