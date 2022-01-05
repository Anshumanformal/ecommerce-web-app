const jwt = require("jsonwebtoken");
const Model = require("../models");

async function findAccount(token, dataOk) {
    try {
        if (dataOk.u_id) {
            const doc = await Model.User.findOne({ _id: dataOk.u_id, accessToken: token, isDeleted: false });
            if(!doc) throw new Error("INVALID_AUTH");
            
            return Object.assign({ role: "user" }, doc.toJSON());
        }
        
        if (dataOk.a_id) {
            const doc = await Model.Admin.findOne({ _id: dataOk.a_id, accessToken: token, isDeleted: false });
            if(!doc) throw new Error("INVALID_AUTH");

            return Object.assign({ role: "admin" }, doc.toJSON());
        }

        return null;
    } catch (error) {
        throw error;
    }
}

module.exports.getToken = (data) => jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "30 days" });
module.exports.verifyToken = (token) => jwt.verify(token, process.env.SECRET_KEY);

module.exports.verify =
    (...args) =>
    async (req, res, next) => {
        try {
            // const roles = [].concat(args).map((role) => role.toLowerCase());

            let token = String(req.headers.authorization || "");
            token = token.replace(/bearer|jwt/i, "").replace(/^\s+|\s+$/g, "");
            if (!token) throw new Error("MISSING_TOKEN");

            const dataOk = this.verifyToken(token);
            const doc = await findAccount(token, dataOk);
            if (!doc) throw new Error("INVALID_TOKEN");

            req.user = doc;
            next();
        } catch (error) {
            console.error(error);
            const message = String(error.name).toLowerCase() === "error" ? error.message : "UNAUTHORIZED_ACCESS";
            return res.error(401, message);
        }
    };

// module.exports.verifySocket = async (socket, next) => {
//     try {
//         const token = socket.handshake.auth.token || socket.handshake.query.token || "";
//         if (!token) throw new Error("MISSING_TOKEN");
//         const dataOk = this.verifyToken(token);
        
//         const doc = await findAccount(token, dataOk);

//         if (!doc) throw new Error("INVALID_TOKEN");

//         socket.handshake["user"] = doc;

//         // proceed next
//         next();
//     } catch (err) {
//         console.log(err)
//         err.status = 401;
//         next(err);
//     }
// };
