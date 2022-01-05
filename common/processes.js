const Services = require("../services");

module.exports.init = async () => {
    console.log("Process Initialized");

    process.on("sendEmail", async (args) => {
        await Services.EmailService.send(args);
    });

    // process.on("sendPush", async (args) => {
    //     await Services.PushNotification.sendToUsers(args);
    // });
};
