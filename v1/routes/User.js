const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: path.join(__dirname, "public", "uploads", "user")/* + "/public/uploads/user"*/,
    filename: function (req, file, cb) {
        const extension = "".concat(file.originalname).split(".").pop();
        const filename = Date.now().toString(36);
        cb(null, `${filename}.${extension}`);
    },
});

const upload = multer({ storage });

const Auth = require("../../common/authenticate");
const Controller = require("../controllers");


// ONBOARDING APIs
router.post("/register", Controller.UserController.register);
router.post("/verifyOtp", Controller.UserController.verifyOtp);
router.post("/login", Controller.UserController.login);

router.get("/user", Auth.verify("user"), Controller.UserController.getOneUser);
router.put("/user/:id", Auth.verify("user"), Controller.UserController.updateOneUser);
router.post("/user/updatePassword", Auth.verify("user"), Controller.UserController.updatePassword);


//E-Commerce Web App APIs

// Product routes.
router.post("/product", Auth.verify("user"), Controller.UserController.addProduct);
router.get("/product", Auth.verify("user"), Controller.UserController.getAllProduct);
router.get("/product/:id", Auth.verify("user"), Controller.UserController.getOneProduct);
router.put("/product/:id", Auth.verify("user"), Controller.UserController.updateOneProduct);
router.delete("/product/:productId", Auth.verify("user"), Controller.UserController.deleteOneProduct);

// Cart-Item routes.

// Add bulk addToCart functionality later on to add multiple items at once in the cart.
// Note for bulk add - if any item is already added to the cart, then increment the quantity of the item, else add it to the cart.
router.post("/addToCart", Auth.verify("user"), Controller.UserController.addToCart);
router.get("/getCartDetails", Auth.verify("user"), Controller.UserController.getCartDetails);
router.patch("/updateCart/:productId", Auth.verify("user"), Controller.UserController.updateCart);
router.post("/removeItemFromCart", Auth.verify("user"), Controller.UserController.removeItemFromCart);
router.post("/clearCart", Auth.verify("user"), Controller.UserController.clearCart);


// Cart routes.
router.post("/cartCheckout", Auth.verify("user"), Controller.UserController.cartCheckout);

router.post("/payment", Auth.verify("user"), Controller.UserController.payment);
router.post("/stripeTokenGenerator", Auth.verify("user"), Controller.UserController.stripeTokenGenerator);
// router.post("/testFetch", Auth.verify("user"), Controller.UserController.testFetch);

module.exports = router;