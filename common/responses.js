const functions = require("./functions");

module.exports = () => (req, res, next) => {
    // success response
    res.success = (message, data) => {
        message = functions.niceMessage(message);
        return res.send({ statusCode: 200, success: true, message, data: data || null });
    };

    // error response
    res.error = (message, code, data) => {
        message = functions.niceMessage(message);

        const isApp = /\/user\//.test(req.originalUrl || req.url);
        const status = !isApp && code === 401 ? 401 : 208;
        res.status(status).send({ statusCode: code, success: false, message, data: data || null });
    };

    // proceed forward
    next();
};
