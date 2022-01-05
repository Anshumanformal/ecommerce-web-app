const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "public", "uploads", "admin") /*+ "/public/uploads/admin"*/,
    filename: function (req, file, cb) {
        const extension = "".concat(file.originalname).split(".").pop();
        const filename = Date.now().toString(36);
        cb(null, `${filename}.${extension}`);
    },
});
const upload = multer({ storage });

const Auth = require("../../common/authenticate");
const Controller = require("../controllers");

router.post("/register", Controller.AdminController.register);
router.post("/login", Controller.AdminController.login);
router.post("/uploadImage", Auth.verify("admin"), Controller.AdminController.uploadImage);
router.get("/getAdmin", Auth.verify("admin"), Controller.AdminController.getAdminData);

router.get("/user", Auth.verify('admin'), Controller.AdminController.getAllUser);
router.get("/user/:id", Auth.verify('admin'), Controller.UserController.getOneUser);        //When the admin wants the data of a user.
router.delete("/:userId", Auth.verify("admin"), Controller.AdminController.deleteOneUser);

module.exports = router;