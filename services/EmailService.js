const nodemailer = require("nodemailer");

module.exports.sendEmail = async (emailObj) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `${process.env.SMTP_USER}`,
            to: [].concat(emailObj.to),
            subject: `${emailObj.title}`,
            text: `${emailObj.message}`.replace(/\<\/?br\/?\>/g, "\n").replace(/\<[^\>]+\>/g, ""),
            html: `${emailObj.message}`,
        });

        console.log("EmailService", info);
    } catch (error) {
        console.error("EmailService", error);
    }
};
