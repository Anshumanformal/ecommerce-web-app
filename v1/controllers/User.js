const Model = require("../../models");
const Validation = require("../validations");
const Auth = require("../../common/authenticate");
const Services = require("../../services/index");
const functions = require("../../common/functions");
const bcrypt = require('bcryptjs');
const path = require("path");
const stripe = require('stripe')(process.env.STRIPE_KEY);



module.exports.register = async (req, res, next) => {
    try {
        await Validation.User.register.validateAsync(req.body);

        let user = await Model.User.findOne({
            email: req.body.email,
            isDeleted : false,
        })
        if(user) return res.error(`USER_WITH_THIS_EMAIL_ALREADY_EXISTS`);
        let otpval = functions.generateNumber(4);  // otpval has type string.

        //Creating new user.
        user = await Model.User.create(req.body);

        //Hash the password.
        let user_with_hashed_password = await user.setPassword(req.body.password);
        req.body.password = await user_with_hashed_password.password;

        let emailObj = {
            to: req.body.email,
            title: "OTP for registration",
            message: `Here is your OTP for registration. OTP : ${otpval}`,
        };

        //Nodemailer service for sending email.
        // await Services.EmailService.sendEmail(emailObj);  // Configure this at last. More emails sent can disable the email account.
        user.oneTimeCode = otpval;

        await user.save();
        return res.success("USER_REGISTERED_SUCCESSFULLY", user);

    } catch (error) {
        next(error);
    }
}

module.exports.verifyOtp = async (req, res, next) => {
    //Here we verify the OTP and hence the email.
    try {
        await Validation.User.verifyOtp.validateAsync(req.body);
        let otp = req.body.otp;

        let user = await Model.User.findOne({email : req.body.email, isDeleted : false});
        if(!user) return res.error("USER_NOT_FOUND");

        if(user.oneTimeCode === otp){
            user.oneTimeCode = "";
            user.isEmailVerified = true;
            await user.save();
            res.success("OTP_IS_CORRECT_AND_EMAIL_VERIFIED_SUCCESSFULLY");
        }
        else return res.error("OTP_IS_INCORRECT");

    } catch (error) {
        next(error);
    }
}

module.exports.login = async (req, res, next) => {
    try {
        await Validation.User.login.validateAsync(req.body);

        let user = await Model.User.findOne({email : req.body.email, isDeleted : false});
        if(!user) return res.error("USER_NOT_FOUND");

        await user.authenticate(req.body.password);
        user.accessToken = Auth.getToken({
            u_id: user._id,
        });
        await user.save();
        res.success("USER_LOGGED_IN_SUCCESSFULLY", user);

    } catch (error) {
        next(error);
    }
}

module.exports.getOneUser = async (req, res, next) => {
    try {

        let doc = await Model.User.findOne({ _id: req.user._id, isDeleted : false}).lean();

        return res.success("USER_DATA_FETCHED", doc);
    } catch (error) {
        next(error);
    }
}


module.exports.updateOneUser = async (req, res, next) => {
    try {
        await Validation.User.updateUser.validateAsync(req.body);

        const filter = { _id: req.params.id };
        const update = req.body;
        const options = {
            new: true,
        };

        let doc = await Model.User.findOneAndUpdate(filter, update, options);

        return res.success("USER_DATA_UPDATED_SUCCESSFULLY", doc);
    } catch (error) {
        next(error);
    }
}

module.exports.updatePassword = async (req, res, next) => {
    try {

        await Validation.User.updatePassword.validateAsync(req.body);

        let user = await Model.User.findOne({_id : req.user._id, isDeleted : false});

        let passwordOk = await bcrypt.compare(req.body.password, user.password);
        // console.log('passwordOk----------', passwordOk);
        
        await user.setPassword(req.body.password);
        return res.success("PASSWORD_UPDATED_SUCCESSFULLY");

    } catch (error) {
        next(error);
    }
}

module.exports.uploadImage = async(req, res, next) => {
    try {
       
        if(!req.file) throw new Error("ERROR_WHILE_UPLOADING");
        let user = await Model.User.findOne({_id : req.user._id});

        const newPath = req.file.path.split("public").pop();
        
        const fullImageName = process.env.BASE_URL + newPath;
        user.imageUrl = fullImageName;
        await user.save();

        res.success("IMAGE_UPLOADED_SUCCUSSFULLY", user);

    } catch (error) {
        next(error);
    }
}

module.exports.addProduct = async (req, res, next) => {
    try {
        await Validation.Product.addProduct.validateAsync(req.body);

        let product = await Model.Product.findOne({productName : req.body.productName});
        if(product) return res.error("PRODUCT_ALREADY_EXISTS");

        product = await Model.Product.create(req.body);
        return res.success("PRODUCT_CREATED_SUCCESSFULLY");

    } catch (error) {
        next(error);
    }
}

module.exports.getAllProduct = async (req, res, next) => {
    try {

        let page = req.query.page ? Number(req.query.page) : 1;
        let count = req.query.count ? Number(req.query.count) : 10;
        let skipNo = Number((page - 1) * count);
        let sort = { createdAt: -1 };

        let query = { isDeleted: false};

        let doc = await Model.Product.find(query).sort(sort).limit(count).skip(skipNo);
        const itemCount = await Model.Product.find(query).countDocuments(query);
        let sendObj = { itemCount, doc };

        return res.success("PRODUCT_DATA_FETCHED", sendObj);
        
    } catch (error) {
        next(error);
    }
}

module.exports.getOneProduct = async (req, res, next) => {
    try {
        
        let doc = await Model.Product.findOne({ _id: req.params.id, isDeleted : false}).lean();

        return res.success("PRODUCT_DATA_FETCHED", doc);
    } catch (error) {
        next(error);
    }
}

module.exports.updateOneProduct = async (req, res, next) => {
    try {
        await Validation.Product.updateProduct.validateAsync(req.body);

        const filter = { _id: req.params.id };
        const update = req.body;
        const options = {
            new: true,
        };

        let doc = await Model.Product.findOneAndUpdate(filter, update, options);

        return res.success("PRODUCT_DATA_UPDATED_SUCCESSFULLY", doc);
    } catch (error) {
        next(error);
    }
}

module.exports.deleteOneProduct = async (req, res, next) => {
    try {
        const filter = { _id: req.params.productId };
        const update = {isDeleted : true}
        const options = {
            new: true,
        };

        //Checking if the product was already deleted.
        let productDel = await Model.Product.findOne({_id : req.params.productId});
        if(productDel.isDeleted == true) return res.error("PRODUCT_ALREADY_DELETED");

        let doc = await Model.Product.findOneAndUpdate(filter, update, options);

        return res.success("PRODUCT_SOFT_DELETED_SUCCESSFULLY", doc);
    } catch (error) {
        next(error);
    }
}

module.exports.addToCart = async (req, res, next) => {
    try {
        await Validation.Cart_Item.addToCart.validateAsync(req.body);

        let cart = await Model.Cart_Item.findOne({product : req.body.productId});
        if(cart) return res.error("ITEM_ALREADY_ADDED_TO_CART");
        
        let product = req.body.productId;
        req.body.product = product;
        delete req.body.productId;

        //Item added to the cart.
        cart = await Model.Cart_Item.create(req.body);

        return res.success("ITEM_ADDED_TO_CART_SUCCESSFULLY", cart);

    } catch (error) {
        next(error);
    }
}

// Fetches the list of items present inside the cart.
module.exports.getCartDetails = async (req, res, next) => {
    try {
        let page = req.query.page ? Number(req.query.page) : 1;
        let count = req.query.count ? Number(req.query.count) : 10;
        let skipNo = Number((page - 1) * count);
        let sort = { createdAt: -1 };

        let query = { isDeleted: false};

        let doc = await Model.Cart_Item.find(query).populate("product").sort(sort).limit(count).skip(skipNo);
        const itemCount = await Model.Cart_Item.find(query).countDocuments(query);
        let sendObj = { itemCount, doc };

        return res.success("CART_DATA_FETCHED", sendObj);
    } catch (error) {
        next(error);
    }
}

// Here, we update the quantity of item in the cart.
module.exports.updateCart = async (req, res, next) => {
    try {

        await Validation.Cart_Item.updateCart.validateAsync(req.body);
        
        const filter = { product: req.params.productId };
        const update = req.body;
        const options = {
            new: true,
        };

        let doc = await Model.Cart_Item.findOneAndUpdate(filter, update, options);
        if(!doc) return res.error("ITEM_NOT_FOUND");

        return res.success("ITEM_QUANTITY_UPDATED_IN_CART_SUCCESSFULLY", doc);

    } catch (error) {
        next(error);
    }
}

module.exports.removeItemFromCart = async (req, res, next) => {
    try {
        let itemArr = req.body;
        let itemToRemove;
        itemArr.forEach(async (item) => {
            itemToRemove = item._id_of_itemId;
            let result = await Model.Cart_Item.findByIdAndDelete(itemToRemove);
            console.log('result-->>', result);
        })

        res.success('SPECIFIED_ITEMS_CLEARED_FROM_CART_SUCCESSFULLY');

    } catch (error) {
        next(error);
    }
}

module.exports.clearCart = async (req, res, next) => {
    try {
        
        res.success('CART_CLEARED_SUCCESSFULLY',await Model.Cart_Item.deleteMany({}));

    } catch (error) {
        next(error);
    }
}

// module.exports.testFetch = async (req, res, next) => {
//     try {
//         const axios = require('axios');
//             let result = await axios('https://www.google.com');
//             console.log(result);
//         // res.success("DATA_FROM_GOOGLE", result);

//     } catch (error) {
//         console.error(error);
//         // next(error);
//     }
// }

module.exports.cartCheckout = async (req, res, next) => {
    try {
        
        // await Validation.Cart_Item.addToCart.validateAsync(req.body);

        let cart = await Model.Cart.findOne({product : req.body.productId});
        if(cart) return res.error("ITEM_ALREADY_ADDED_TO_CART");
        
        let product = req.body.productId;
        req.body.product = product;
        delete req.body.productId;

        //Item added to the cart.
        cart = await Model.Cart_Item.create(req.body);

        return res.success("ITEM_ADDED_TO_CART_SUCCESSFULLY", cart);

    } catch (error) {
        next(error);
    }
}



module.exports.payment = async (req, res, next) => {
    try {

        // Find the user.
        let user = await Model.User.findOne({_id : req.user._id});

        // 'wowaha1234@yopmail.com'
        const customer = await stripe.customers.create({
            email: user.email,
        });

        // Get all product details.
        const cartDetails = await Model.Cart_Item.find({}).populate('product');
        // console.log(cartDetails);
        // return;
        let total = 0;
        // const items = req.body.items;
        const items = JSON.parse(JSON.stringify(req.body.items));    // Cleaning the req.body.items as it is not working without
        // cleaning the req.body.items
        // Iterate through the array of items from the frontend, and match each ID with the database item ID.
        // console.log(items);
        // return;

        let line_items_second = [];

        items.map((item) => {
            const itemMatched = cartDetails.find((i) => {
                // if(i._id.equals(item)){
                //     console.log('here');
                // }
                // if((i._id).toString() === item){
                //     console.log('here');
                // }
                if(JSON.stringify(i._id) === JSON.stringify(item)){
                    line_items_second.push({
                        price_data : {
                            currency: "inr",
                            product_data: {
                                name: i.product.productName,
                                images: [i.product.imageUrl],
                            },
                            unit_amount: i.product.price
                        },
                        quantity: i.quantity,
                        // productName : i.product.productName,
                        // productPrice : i.product.price,
                        // productImage : i.product.imageUrl,
                        // productQuantity: i.quantity
                    })
                    return line_items_second;
                }

            })
            console.log('item matched:-------', itemMatched)
            console.log('line_items_second:-------', JSON.stringify(line_items_second));
            total += itemMatched.product.price * Number(itemMatched.quantity);
        })

        // console.log('total:-------', total);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [...line_items_second],
            mode: "payment",
            success_url: `${process.env.BASE_URL}/success.html`,
            cancel_url: `${process.env.BASE_URL}/cancel.html`,
        });

        if(session){
            // After payment is done.
            // Clear the items from the cart.
        await Model.Cart_Item.deleteMany({});
        return res.json({
            message : "Cart cleared successfully. Below are the session details.",
            id: session.id,
            success_url: session.success_url,
            cancel_url: session.cancel_url,
            });
        }

        // items.forEach((item) => {
        //     const itemMatched = cartDetails.find((i) => {
        //         // console.log('i._id-------',i._id)
        //         // console.log('item------',ObjectId(item));
        //         // return;
        //         if(i._id === new ObjectId(item)){
        //             console.log('here');
                    // line_items_second.push({
                    //     productName : i.product.productName,
                    //     productPrice : i.product.price,
                    //     productQuantity: i.quantity
                    // })
        //             // console.log('line----------', line_items_second);
        //         } 
        //         // return line_items_second;
        //     })
        //     // console.log('item matched:-------', itemMatched)
        //     // console.log('line_items_second:-------', line_items_second);
        //     // line_items_second.push({
        //     //     itemMatched
        //     // })

        //     // total += itemMatched.product.price * Number(itemMatched.quantity);
        // })
  


        // Old method.

        // let stripeCharge = await stripe.charges.create({
        //     amount: total,
        //     source: req.body.stripeTokenId,
        //     currency: 'usd'
        //   })
        //   if(!stripeCharge){
        //     console.log('checkout failed');
        //     return res.error("CHARGE_FAIL");
        //   } 
        //   else{
        //     console.log('checkout done');
        //     return res.success("CHECKOUT_SUCCESSFUL");
        //   } 


        
        //----------------------------
            // const {productInCart} = req.body;

            // // If details are already going to be filled up, then remove the below database query in future.
            // let productInfoFromCart = await Model.Cart_Item.findOne({_id : productInCart}).populate('product');
            
            // const session = await stripe.checkout.sessions.create({
            //     payment_method_types: ["card"],
            //     line_items: [
            //         {
            //             price_data: {
            //                 currency: "inr",
            //                 product_data: {
            //                     name: productInfoFromCart.product.productName,
            //                     images: [productInfoFromCart.product.imageUrl],
            //                 },
            //                 unit_amount: productInfoFromCart.product.price * 100,
            //             },
            //             quantity: productInfoFromCart.quantity,
            //         },
            //     ],
            //     mode: "payment",
            //     success_url: `${process.env.BASE_URL}/success.html`,
            //     cancel_url: `${process.env.BASE_URL}/cancel.html`,
            // });

            
        
            // return res.json({
            //     id: session.id,
            //     success_url: session.success_url,
            //     cancel_url: session.cancel_url,
            // });
        //----------------------------
        // paymentCheckout();
        // After payment is done.
        // Clear the items from the cart.
        // await Model.Cart_Item.deleteMany({})



        // res.success('CART_CLEARED_SUCCESSFULLY',await Model.Cart_Item.deleteMany({}));

    } catch (error) {
        next(error);
    }
}

module.exports.stripeTokenGenerator = async (req, res, next) => {
    try {
        
        const stripeHandler = StripeCheckout.config()


    } catch (error) {
        next(error);
    }
}


