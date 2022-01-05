const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.addProduct = Joi.object({
    productName: Joi.string().required(),
    price: Joi.number().required(),
    // category: Joi.string().required(),
    description: Joi.string().optional().allow(""),
});

module.exports.updateProduct = Joi.object({
    productName: Joi.string().required(),
    price: Joi.number().required(),
    // category: Joi.string().required(),
    description: Joi.string().required(),
});