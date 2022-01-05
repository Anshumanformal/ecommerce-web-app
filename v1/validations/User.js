const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.identify = Joi.object({
    id: Joi.objectId().required(),
});

module.exports.register = Joi.object({
    firstName : Joi.string().required(),
    lastName : Joi.string().required(),
    username : Joi.string().optional(),
    email : Joi.string().required(),
    password : Joi.string().pattern(new RegExp(/^[a-zA-Z0-9!@#$%^&*()]{3,25}$/)).required(),
})

module.exports.verifyOtp = Joi.object({
    email : Joi.string().required(),
    otp : Joi.string().required(),
})

module.exports.login = Joi.object({
    email : Joi.string().required(),
    password : Joi.string().required(),
})

module.exports.updateUser = Joi.object({
    firstName : Joi.string().optional().allow(""),
    lastName : Joi.string().optional().allow(""),
    username : Joi.string().optional().allow(""),
})

module.exports.updatePassword = Joi.object({
    password : Joi.string().required(),
})