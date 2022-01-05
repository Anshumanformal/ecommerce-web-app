const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.addToCart = Joi.object({
    productId : Joi.objectId().required(),
    quantity : Joi.string().optional().allow(""),
})

module.exports.updateCart = Joi.object({
    quantity : Joi.string().required(),
})