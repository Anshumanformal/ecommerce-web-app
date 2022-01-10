const stripe = require('stripe')(process.env.STRIPE_KEY);

module.exports.createCustomer = async (email) => {
     // 'wowaha1234@yopmail.com'
     const customer = await stripe.customers.create({
        email: email,
    });
    return customer;
}

module.exports.purchaseMultipleItems = (total, items, cartDetails) => {
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

    return line_items_second;
}

module.exports.stripeSession = async (line_items_second) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [...line_items_second],
        mode: "payment",
        success_url: `${process.env.BASE_URL}/success.html`,
        cancel_url: `${process.env.BASE_URL}/cancel.html`,
    });
    return session;
}